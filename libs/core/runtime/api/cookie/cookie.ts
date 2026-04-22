import { CookieOptions } from 'hono/dist/types/utils/cookie';

type CookieParams = CookieOptions & {
  name: string;
  value: string;
};

export class Cookie {
  readonly name: string;
  readonly value: string;
  readonly options: CookieOptions;

  constructor({ name, value, maxAge, domain, path, httpOnly, secure, sameSite }: CookieParams) {
    this.name = name;
    this.value = value;
    this.options = {
      ...(maxAge ? { maxAge } : {}),
      domain: domain ?? '',
      path: path ?? '/',
      httpOnly: httpOnly ?? true,
      secure: secure ?? true,
      sameSite: sameSite ?? 'lax',
    };
  }
}
