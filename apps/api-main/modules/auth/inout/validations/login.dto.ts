import { ZodType } from 'zod';

import { zodSchema } from '@libs/common/api';
import { BaseValidator } from '@libs/core';

export interface LoginDto {
  email: string;
  password: string;
}

import { schema } from './schema';

export class LoginDto extends BaseValidator<LoginDto> {
  protected schema(): ZodType {
    return zodSchema<LoginDto>({
      email: schema.email,
      password: schema.password,
    });
  }
}
