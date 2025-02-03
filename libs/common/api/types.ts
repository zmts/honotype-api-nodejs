import { StatusCode } from 'hono/dist/types/utils/http-status';

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
