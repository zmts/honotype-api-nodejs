import { Context, HonoRequest } from 'hono';
import { HTTPException } from 'hono/http-exception';

import { ApiResponseError, AppError } from '@libs/common/errors';

interface IReqPayload {
  path: HonoRequest['path'];
  method: HonoRequest['method'];
  query: Record<string, string>;
  headers: Record<string, string>;
  body: any;
  user?: any;
}

export async function globalExceptionHandler(exception: Error, c: Context): Promise<any> {
  const request = c.req;

  const reqPayload: IReqPayload = {
    path: request.path,
    method: request.method,
    query: request.query(),
    body: await request.json(),
    headers: request.header(),
  };

  let responseError: ApiResponseError<any>;
  if (exception instanceof AppError) {
    responseError = createAppError(exception, { path: request.path });
    logError(exception, reqPayload);
  } else if (exception instanceof HTTPException) {
    responseError = createHTTPException(exception, { path: request.path });
    logError(exception, reqPayload);
  } else {
    responseError = createGenericError(exception, { path: request.path });
  }
  c.status(responseError.status);
  return c.json(responseError);
}

function createAppError(exception: AppError, { path }: { path: string }): ApiResponseError<any> {
  const { message, code, entity, description, meta, error } = exception;

  return new ApiResponseError({
    timestamp: new Date().toISOString(),
    path,
    status: exception.status,
    code,
    message,
    entity,
    ...(description && description !== message && { description }),
    ...(meta && { meta }),
    error,
  });
}

function createHTTPException(exception: HTTPException, { path }: { path: string }): ApiResponseError<any> {
  return new ApiResponseError({
    timestamp: new Date().toISOString(),
    path,
    status: exception.status,
    message: exception.message,
  });
}

function createGenericError(exception: Error | unknown, { path }: { path: string }): ApiResponseError<any> {
  return new ApiResponseError({
    timestamp: new Date().toISOString(),
    path,
    status: 500,
    message: exception instanceof Error ? exception.message : 'Unknown error occurred.',
  });
}

function logError(exception: Error, reqPayload: IReqPayload): void {
  const skipStatusCodes = new Set([400, 401, 403, 404, 422]);
  const skipLogging = exception instanceof AppError && skipStatusCodes.has(exception.status);

  if (!skipLogging) {
    console.error(reqPayload);
    console.error(exception);
  }
}
