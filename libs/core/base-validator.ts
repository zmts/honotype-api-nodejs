import { ZodType } from 'zod';

import { AppError, ErrorCode } from '@libs/common/errors';

export abstract class BaseValidator<T> {
  constructor(private target: T) {
    this.validate(this.target, this.schema());
    Object.assign(this, target);
  }

  protected abstract schema(): ZodType;

  private validate(target: T, schema: ZodType<T>): true | Error {
    const { success, error } = schema.safeParse(target);
    if (!success) {
      const errors = error.flatten().fieldErrors;
      throw new AppError(ErrorCode.VALIDATION, { error: errors });
    }

    return true;
  }
}
