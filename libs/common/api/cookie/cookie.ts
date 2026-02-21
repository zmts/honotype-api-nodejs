import { CookieOptions } from 'hono/dist/types/utils/cookie';

type CookieParams = CookieOptions & {
  name: string;
  value: string;
};

export class Cookie {
  public readonly name: string;
  public readonly value: string;
  public readonly options: CookieOptions;

  constructor({ name, value, maxAge, domain, path, httpOnly, signingSecret, secure, sameSite }: CookieParams) {
    this.name = name;
    this.value = value;
    this.options = {
      ...(maxAge ? { maxAge } : {}),
      ...(signingSecret ? { signingSecret } : {}),
      domain: domain ?? '',
      path: path ?? '/',
      httpOnly: httpOnly ?? true,
      secure: secure ?? true,
      sameSite: sameSite ?? 'lax',
    };
  }
}
