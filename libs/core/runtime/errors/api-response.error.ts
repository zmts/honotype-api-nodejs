import { HttpStatus } from '@libs/core';

export interface ApiResponseError<E> {
  timestampIso: string;
  path: string;
  status: HttpStatus;
  code: string;
  message: string;
  entity: string;
  description: string;
  meta: any;
  error: E;
}

export class ApiResponseError<E> implements ApiResponseError<E> {
  constructor(partial: Partial<ApiResponseError<E>>) {
    Object.assign(this, partial);
  }
}
