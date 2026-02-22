import { ZodType } from 'zod';

import { zodSchema } from '@libs/common/api';
import { BaseValidator } from '@libs/core';

import { schema } from './schema';

export interface LoginDto {
  email: string;
  password: string;
  fingerprint: string;
}

export class LoginDto extends BaseValidator<LoginDto> {
  protected schema(): ZodType<LoginDto> {
    return zodSchema<LoginDto>({
      email: schema.email,
      password: schema.password,
      fingerprint: schema.fingerprint,
    });
  }
}
