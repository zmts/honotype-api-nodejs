import { Context } from 'hono';

import { AppError, ErrorCode } from '@libs/common/errors';

import { CURRENT_USER } from './constants';

import { CurrentUserJwt } from './';

export function getCurrentUserJwt(c: Context): CurrentUserJwt {
  const user: CurrentUserJwt = c.get(CURRENT_USER);
  if (!user) {
    throw new AppError(ErrorCode.NO_ANONYMOUS_ACCESS);
  }
  return user;
}
