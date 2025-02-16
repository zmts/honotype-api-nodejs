import { Hono, Context } from 'hono';

import { getCurrentUserJwt } from '@libs/common/jwt';
import { BaseController, IBaseController } from '@libs/core';

import { GetCurrentUserAction } from './actions';
import { dependency } from './dependency';

export class UsersController extends BaseController implements IBaseController {
  constructor(private router = new Hono().basePath('users')) {
    super();
  }

  get routes(): Hono {
    this.router.get('/current', async (c: Context) =>
      this.execute(c, new GetCurrentUserAction(dependency).run(getCurrentUserJwt(c))),
    );

    return this.router;
  }

  init(): Promise<void> {
    console.log(`${this.constructor.name} started...`);
    return Promise.resolve();
  }
}
