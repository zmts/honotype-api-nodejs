import { Context } from 'hono';
import { setCookie } from 'hono/cookie';

import { Cookie } from './';

export function setCookies(c: Context, cookies: Cookie[]): void {
  for (const cookie of cookies) {
    setCookie(c, cookie.name, cookie.value, cookie.options);
  }
}
