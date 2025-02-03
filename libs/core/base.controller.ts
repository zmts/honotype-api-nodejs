import { Context, TypedResponse } from 'hono';

import { Resource, HttpStatus, IPaginationResponse } from '@libs/common/api';

interface IApiResponse {
  status: HttpStatus;
  data: any;
  pagination?: IPaginationResponse;
  meta?: any;
}

export abstract class BaseController {
  async execute(c: Context, action: Promise<Resource>): Promise<TypedResponse<IApiResponse>> {
    const resource = await action;

    const apiResponse = resource.toResponse();
    const status = apiResponse.status || apiResponse.getStatus(c.req.method);
    c.status(status);

    return c.json<IApiResponse>({
      status,
      data: apiResponse.data,
      pagination: apiResponse.pagination,
      meta: apiResponse.meta,
    });
  }
}
