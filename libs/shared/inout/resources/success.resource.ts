import { Resource } from '@libs/common/api';

import { SuccessContract } from '../contracts';

export class SuccessResource extends Resource<SuccessContract> {
  constructor() {
    super();
  }

  result(): SuccessContract {
    return { success: true };
  }
}
