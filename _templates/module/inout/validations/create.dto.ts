import { ZodType } from 'zod';

import { zodSchema } from '@libs/common/api';
import { BaseValidator } from '@libs/core';

import { schema } from './schema';

export interface CreateDto {
  name: string;
}

export class CreateDto extends BaseValidator<CreateDto> {
  protected schema(): ZodType<CreateDto> {
    return zodSchema<CreateDto>({
      name: schema.name,
    });
  }
}
