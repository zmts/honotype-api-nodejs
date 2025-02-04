import { z, ZodType } from 'zod';

import { zodSchema } from '@libs/common/api';
import { BaseValidator } from '@libs/core';

export interface CreateDto {
  name: string;
  title: string;
}

export class CreateDto extends BaseValidator<CreateDto> {
  protected schema(): ZodType {
    return zodSchema<CreateDto>({
      name: z.string().min(3).max(500),
      title: z.string().min(3).max(500),
    });
  }
}
