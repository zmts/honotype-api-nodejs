import { serve } from '@hono/node-server';
import { Hono } from 'hono';

import { globalExceptionHandler } from '@libs/common/api';

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

const port = 3000;
console.log(`Server is running on http://localhost:${port}`);

serve({ fetch: app.fetch, port });
