import { z, ZodType } from 'zod';

import { zodSchema } from '@libs/common/api';
import { BaseValidator } from '@libs/core';

export interface CreatePostDto {
  title: string;
  description: string;
}

export class CreatePostDto extends BaseValidator<CreatePostDto> {
  protected schema(): ZodType {
    return zodSchema<CreatePostDto>({
      title: z.string(),
      description: z.string(),
    });
  }
}
