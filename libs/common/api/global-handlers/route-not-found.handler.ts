import { Context } from 'hono';

export function routeNotFound(c: Context): Response {
  return c.json({ method: c.req.method, path: c.req.path, message: `Route not Found` }, 404);
}
