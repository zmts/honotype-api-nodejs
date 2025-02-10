import { z, ZodType } from 'zod';

import { zodSchema } from '@libs/common/api';
import { BaseValidator } from '@libs/core';

export interface CreateDto {
  email: string;
  firstname: string;
  lastname: string;
}

export class CreateDto extends BaseValidator<CreateDto> {
  protected schema(): ZodType {
    return zodSchema<CreateDto>({
      email: z.string().email(),
      firstname: z.string().min(3).max(500).optional(),
      lastname: z.string().min(3).max(500).optional(),
    });
  }
}
