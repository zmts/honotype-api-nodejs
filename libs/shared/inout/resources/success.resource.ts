import { IResponseOptions, Resource } from '@libs/common/api';

import { SuccessContract } from '../contracts';

export class SuccessResource extends Resource<SuccessContract> {
  constructor(private responseOptions: IResponseOptions = {}) {
    super();
  }

  options(): IResponseOptions {
    return this.responseOptions;
  }

  result(): SuccessContract {
    return { success: true };
  }
}
