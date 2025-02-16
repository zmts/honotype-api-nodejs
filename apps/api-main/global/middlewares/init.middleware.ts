import { Context, Next } from 'hono';

export async function initMiddleware(c: Context, next: Next): Promise<void> {
  await next();
}
