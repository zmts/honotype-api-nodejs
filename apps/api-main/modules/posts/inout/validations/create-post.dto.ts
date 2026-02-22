import { ZodType } from 'zod';

import { zodSchema } from '@libs/common/api';
import { BaseValidator } from '@libs/core';

import { schema } from './schema';

export interface CreatePostDto {
  title: string;
  description?: string;
}

export class CreatePostDto extends BaseValidator<CreatePostDto> {
  protected schema(): ZodType<CreatePostDto> {
    return zodSchema<CreatePostDto>({
      title: schema.title,
      description: schema.description.optional(),
    });
  }
}
