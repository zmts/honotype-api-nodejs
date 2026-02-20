import { ZodType } from 'zod';

import { AppError, ErrorCode } from '@libs/common/errors';

type ExcludeBaseKeys<T> = Omit<T, 'schema' | 'target' | 'validate'>;

export abstract class BaseValidator<T extends object> {
  constructor(private target: ExcludeBaseKeys<T>) {
    this.validate(this.target as T, this.schema());
    Object.assign(this, target);
  }

  protected abstract schema(): ZodType<T>;

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
