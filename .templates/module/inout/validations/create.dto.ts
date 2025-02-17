import { z, ZodType } from 'zod';

import { zodSchema } from '@libs/common/api';
import { BaseValidator } from '@libs/core';

export interface CreateDto {
  name: string;
}

export class CreateDto extends BaseValidator<CreateDto> {
  protected schema(): ZodType {
    return zodSchema<CreateDto>({
      name: z.string(),
    });
  }
}
