import { StatusCode } from 'hono/dist/types/utils/http-status';
import { ZodType } from 'zod';

import { Cookie } from './cookie';

export type HttpStatus = StatusCode;

export interface IResponseOptions {
  status?: HttpStatus;
  headers?: Record<string, string>;
  cookies?: Cookie[];
  pagination?: IPaginationResponse;
  meta?: any;
}

export interface IPaginationResponse {
  limit: number;
  total: number;
}

export type ZodFrom<T extends { [key: string]: any }> = {
  [key in keyof T]: ZodType<T[key]>;
};
