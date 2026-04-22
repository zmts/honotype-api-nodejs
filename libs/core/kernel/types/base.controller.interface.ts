import { Hono } from 'hono';

export interface IBaseController {
  init(): Promise<void>;
  get routes(): Hono;
}
