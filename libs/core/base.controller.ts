import { Context, TypedResponse } from 'hono';

import { Resource, HttpStatus, IPaginationResponse } from '@libs/common/api';

interface IApiResponse<T> {
  status: HttpStatus;
  data: T | any;
  pagination?: IPaginationResponse;
  meta?: any;
}

export abstract class BaseController {
  async execute<R>(c: Context, action: Promise<Resource<R>>): Promise<TypedResponse<IApiResponse<R>>> {
    const resource = await action;

    const apiResponse = resource.toResponse();
    const status = apiResponse.status || apiResponse.getStatus(c.req.method);
    c.status(status);

    return c.json<IApiResponse<R>>({
      status,
      data: apiResponse.data,
      pagination: apiResponse.pagination,
      meta: apiResponse.meta,
    });
  }
}
