import { Hono, Context } from 'hono';

import { BaseController, IBaseController } from '@libs/core';

import { CreateAction } from './actions';
import { dependency } from './dependency';
import { CreateDto } from './inout';

export class ItemsController extends BaseController implements IBaseController {
  constructor(private router = new Hono().basePath('items')) {
    super();
  }

  get routes(): Hono {
    this.router.post('/', async (c: Context) =>
      this.execute(c, new CreateAction(dependency).run(new CreateDto(await c.req.json()))),
    );
    return this.router;
  }

  init(): Promise<void> {
    console.log(`${this.constructor.name} started...`);
    return Promise.resolve();
  }
}
