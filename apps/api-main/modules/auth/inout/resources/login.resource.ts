import { Resource } from '@libs/common/api';

import { LoginContract } from '../contracts';

export class LoginResource extends Resource<LoginContract> {
  constructor(private item: { accessToken: string }) {
    super();
  }

  result(): LoginContract {
    return {
      accessToken: this.item.accessToken,
    };
  }
}
