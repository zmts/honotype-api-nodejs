import { z, ZodType } from 'zod';

import { zodSchema } from '@libs/common/api';
import { BaseValidator } from '@libs/core';

export interface LoginDto {
  email: string;
  password: string;
}

export class LoginDto extends BaseValidator<LoginDto> {
  protected schema(): ZodType {
    return zodSchema<LoginDto>({
      email: z.string().email(),
      password: z.string().min(8).max(32),
    });
  }
}
