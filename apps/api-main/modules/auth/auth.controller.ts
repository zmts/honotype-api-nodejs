import { Hono, Context } from 'hono';

import { BaseController, IBaseController } from '@libs/core';

import { LoginAction, RegisterAction } from './actions';
import { container } from './dependency';
import { LoginDto, RegisterDto } from './inout';

export class AuthController extends BaseController implements IBaseController {
  constructor(private router = new Hono().basePath('auth')) {
    super();
  }

  get routes(): Hono {
    this.router.post('/register', async (c: Context) =>
      this.execute(c, new RegisterAction(container).run(new RegisterDto(await c.req.json()))),
    );

    this.router.post('/login', async (c: Context) =>
      this.execute(c, new LoginAction(container).run(new LoginDto(await c.req.json()))),
    );

    return this.router;
  }

  init(): Promise<void> {
    console.log(`${this.constructor.name} started...`);
    return Promise.resolve();
  }
}
