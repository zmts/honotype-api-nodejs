import { IResponseOptions, HttpStatus } from './types/types';

const statusCodeMap = new Map<string, HttpStatus>([['POST', 201]]);

export class ApiResponse<T = any> {
  readonly status: HttpStatus;
  readonly cookies: IResponseOptions['cookies'];
  readonly headers: IResponseOptions['headers'];
  readonly pagination: IResponseOptions['pagination'];
  readonly meta: IResponseOptions['meta'];

  constructor(
    readonly data: T,
    options?: IResponseOptions,
  ) {
    this.data = data || null;
    this.status = options?.status;
    this.cookies = options?.cookies || [];
    this.headers = options?.headers || {};
    this.pagination = options?.pagination;
  }

  getStatus(method: string): HttpStatus {
    return statusCodeMap.get(method) || 200;
  }
}
