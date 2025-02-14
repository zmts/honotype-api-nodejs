import { authConfig } from '@api-main/config';
import { googleAuth } from '@hono/oauth-providers/google';
import { Hono, Context } from 'hono';

import { BaseController, IBaseController } from '@libs/core';
import { getGoogleProfile, GoogleAuthProfile, googleAuthDefaultOptions } from '@libs/core/auth/google';

import { LoginAction, LoginGoogleAction, RegisterAction } from './actions';
import { container } from './dependency';
import { LoginDto, RegisterDto } from './inout';

export class AuthController extends BaseController implements IBaseController {
  constructor(private router = new Hono().basePath('auth')) {
    super();
  }

  get routes(): Hono {
    this.router.get(
      '/login/google',
      googleAuth({
        client_id: authConfig.google.clientId,
        client_secret: authConfig.google.clientSecret,
        ...googleAuthDefaultOptions,
      }),
      async c => {
        const raw = c.get('user-google') as GoogleAuthProfile;
        const profile = getGoogleProfile(raw);
        await new LoginGoogleAction(container).run(profile);
        return c.redirect(authConfig.google.frontRedirectURL, 308);
      },
    );

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
