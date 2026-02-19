import { ZodType } from 'zod';

import { zodSchema } from '@libs/common/api';
import { BaseValidator } from '@libs/core';

import { schema } from './schema';

export interface RegisterDto {
  email: string;
  password: string;
}

export class RegisterDto extends BaseValidator<RegisterDto> {
  protected schema(): ZodType {
    return zodSchema<RegisterDto>({
      email: schema.email,
      password: schema.password,
    });
  }
}
