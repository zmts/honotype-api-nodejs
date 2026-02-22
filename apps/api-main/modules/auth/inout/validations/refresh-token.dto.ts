import { ZodType } from 'zod';

import { zodSchema } from '@libs/common/api';
import { BaseValidator } from '@libs/core';

import { schema } from './schema';

export interface RefreshTokenDto {
  refreshToken: string;
  fingerprint: string;
}

export class RefreshTokenDto extends BaseValidator<RefreshTokenDto> {
  protected schema(): ZodType {
    return zodSchema<RefreshTokenDto>({
      refreshToken: schema.refreshToken,
      fingerprint: schema.fingerprint,
    });
  }
}
