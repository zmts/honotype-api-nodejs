import { z, ZodType } from 'zod';

import { zodSchema } from '@libs/common/api';
import { BaseValidator } from '@libs/core';

export interface RegisterDto {
  email: string;
  password: string;
}

export class RegisterDto extends BaseValidator<RegisterDto> {
  protected schema(): ZodType {
    return zodSchema<RegisterDto>({
      email: z.string().email(),
      password: z
        .string()
        .min(8)
        .max(32)
        .regex(/^(?=.*\d)(?=.*[a-z])(?=.*[A-Z]).{8,32}$/),
    });
  }
}
