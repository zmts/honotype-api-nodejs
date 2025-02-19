import { globalDeps, initMiddleware } from '@api-main/global';
import { serve } from '@hono/node-server';
import { Hono } from 'hono';

import { globalExceptionHandler, routeNotFound } from '@libs/common/api';

import { appConfig } from './config';
import { db } from './database';
import { controllers } from './modules';

declare module 'hono' {
  interface ContextVariableMap {}
}

export async function server(): Promise<void> {
  const { rows } = await db.execute('select 1 + 1 as success');
  console.log('########################################');
  console.log('Database connected successfully', rows);
  console.log('########################################\n');

  const app = new Hono({ strict: false }).basePath('api');
  app.use(initMiddleware);
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
  serve({ fetch: app.fetch, port, hostname: host });
}
