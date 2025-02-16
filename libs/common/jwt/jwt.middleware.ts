import { Context, Next } from 'hono';

import { CURRENT_USER } from './constants';

import { CurrentUserJwt } from './';

interface IJwtService {
  verify<T>(token: string): T;
}

export class JwtMiddleware {
  constructor(private jwtService: IJwtService) {}

  async handler(c: Context, next: Next): Promise<void> {
    const accessToken = this.getAccessToken(c);
    if (accessToken) {
      const decoded = this.jwtService.verify<CurrentUserJwt>(accessToken);
      c.set(CURRENT_USER, new CurrentUserJwt(decoded));
    }

    await next();
  }

  private getAccessToken(c: Context): string {
    const bearer = c.req.header('Authorization') || '';
    const [, accessToken] = bearer.split('Bearer ');
    return accessToken || null;
  }
}
