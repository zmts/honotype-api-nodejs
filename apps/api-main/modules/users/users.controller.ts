import { Hono, Context } from 'hono';

import { BaseController, IBaseController } from '@libs/core';

import { CreateAction } from './actions';
import { container } from './dependency';
import { CreateDto } from './inout';

export class UsersController extends BaseController implements IBaseController {
  constructor(private router = new Hono().basePath('users')) {
    super();
  }

  get routes(): Hono {
    this.router.post('/create', async (c: Context) =>
      this.execute(c, new CreateAction(container).run(new CreateDto(await c.req.json()))),
    );

    return this.router;
  }

  init(): Promise<void> {
    console.log(`${UsersController.name} started...`);
    return Promise.resolve();
  }
}
