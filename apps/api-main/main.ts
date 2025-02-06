import { serve } from '@hono/node-server';
import { Hono } from 'hono';

import { globalExceptionHandler } from '@libs/common/api';
import { appConfig } from '@libs/config';

import { controllers } from './modules';

const app = new Hono().basePath('api');

for (const ctl of controllers) {
  const controller = new ctl();
  controller
    .init()
    .then((): Hono => app.route('/', controller.routes))
    .catch();
}

app.onError(globalExceptionHandler);

const { port, host } = appConfig;
console.log(`Server is running on http://${host}:${port}`);
serve({ fetch: app.fetch, port, hostname: host });
