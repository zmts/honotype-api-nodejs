import { Hono, Context } from 'hono';

import { BaseController, IBaseController } from '@libs/core';

export class RootController extends BaseController implements IBaseController {
  constructor(private router = new Hono()) {
    super();
  }

  get routes(): Hono {
    this.router.get('/', (c: Context) => c.json({ ping: 'pong' }));
    return this.router;
  }

  init(): Promise<void> {
    console.log(`${RootController.name} started...`);
    return Promise.resolve();
  }
}
