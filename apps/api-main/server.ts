import process from 'node:process';

import { globalDeps, initMiddleware } from '@api-main/global';
import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { cors } from 'hono/cors';

import { globalExceptionHandler, routeNotFound } from '@libs/core';

import { appConfig } from './config';
import { db } from './database';
import { redis } from './global/dependency/redis';
import { controllers } from './modules';

declare module 'hono' {
  interface ContextVariableMap {}
}

export async function server(): Promise<void> {
  await redis.connect();
  const { rows } = await db.execute('select 1 + 1 as success');
  console.log('########################################');
  console.log('Database connected successfully', rows);
  console.log('########################################\n');

  const app = new Hono({ strict: false }).basePath('/api');
  app.use(initMiddleware);
  app.use(
    '*',
    cors({
      origin: ['http://localhost:3000'], // SPA url
      allowHeaders: ['Content-Type', 'Authorization'],
      allowMethods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
      credentials: true,
    }),
  );

  app.use(globalDeps.jwtMiddleware.handler.bind(globalDeps.jwtMiddleware));

  for (const ctl of controllers) {
    const controller = new ctl();
    await controller.init();
    app.route('/', controller.routes);
  }

  app.notFound(routeNotFound);
  app.onError(globalExceptionHandler);

  const { port, host } = appConfig;
  console.log('\n########################################');
  console.log(`Server is running on ${host}:${port}`);
  console.log('########################################');
  const httpServer = serve({ fetch: app.fetch, port, hostname: host });
  let isShuttingDown = false;

  const shutdown = (): void => {
    if (isShuttingDown) return;
    isShuttingDown = true;

    httpServer.close(() => {
      if (redis.isOpen) redis.destroy();
      db.$client.end().catch(error => {
        console.error('Failed to close database connection', error);
        process.exitCode = 1;
      });
    });
  };

  process.once('SIGINT', shutdown);
  process.once('SIGTERM', shutdown);
}
