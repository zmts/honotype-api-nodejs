import { Context, TypedResponse } from 'hono';

import { Resource, HttpStatus, IPaginationResponse, ResourceList, setCookies } from '@libs/common/api';

interface IApiResponse<T> {
  status: HttpStatus;
  data?: T | any;
  list?: T[] | any[];
  pagination?: IPaginationResponse;
  meta?: any;
}

export abstract class BaseController {
  async execute<R>(
    c: Context,
    action: Promise<Resource<R> | ResourceList<R>>,
  ): Promise<TypedResponse<IApiResponse<R>>> {
    const resource = await action;
    const apiResponse = resource.toResponse();
    const isList = Array.isArray(apiResponse.data);
    const status = apiResponse.status || apiResponse.getStatus(c.req.method);

    c.status(status);
    if (apiResponse.cookies?.length) {
      setCookies(c, apiResponse.cookies);
    }
    if (Object.keys(apiResponse.headers || {}).length) {
      for (const headerKey in apiResponse.headers) {
        c.header(headerKey, apiResponse.headers[headerKey]);
      }
    }

    return c.json<IApiResponse<R>>({
      status,
      list: isList ? apiResponse.data : undefined,
      data: isList ? undefined : apiResponse.data,
      pagination: apiResponse.pagination,
      meta: apiResponse.meta,
    });
  }
}
