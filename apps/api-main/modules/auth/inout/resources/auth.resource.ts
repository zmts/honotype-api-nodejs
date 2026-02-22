import { IResponseOptions, Resource } from '@libs/common/api';

import { LoginContract } from '../contracts';

export class LoginResource extends Resource<LoginContract> {
  constructor(
    private item: { accessToken: string; refreshToken: string },
    private responseOptions: IResponseOptions,
  ) {
    super();
  }

  options(): IResponseOptions {
    return this.responseOptions;
  }

  result(): LoginContract {
    return {
      accessToken: this.item.accessToken,
      refreshToken: this.item.refreshToken,
    };
  }
}
