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
      const rawErrors = error.flatten().fieldErrors;
      const errors = Object.values(rawErrors).length ? rawErrors : null;
      const issue = error.issues?.length ? error.issues[0]?.message : null;
      throw new AppError(ErrorCode.VALIDATION, { error: errors || issue });
    }

    return true;
  }
}
