import { AppError, ErrorCode } from '@libs/common/errors';
import { BaseAction } from '@libs/core';
import { User } from '@libs/entities';

import { IAuthDependency } from '../dependency';
import { LoginDto, LoginResource } from '../inout';

export class LoginAction extends BaseAction<[LoginDto], LoginResource> {
  constructor(
    deps: IAuthDependency,
    private usersRepo = deps.usersRepo,
    private jwtService = deps.jwtService,
  ) {
    super();
  }

  async run(dto: LoginDto): Promise<LoginResource> {
    const user = await this.usersRepo.findOneByEmail(dto.email);

    if (!user) {
      throw new AppError(ErrorCode.INVALID_CREDENTIALS);
    }

    const isValid = await User.checkPassword({ password: dto.password, hash: user.password });
    if (!isValid) {
      throw new AppError(ErrorCode.INVALID_CREDENTIALS);
    }

    const accessToken = this.jwtService.sigh({ id: user.id, uuid: user.uuid });
    return new LoginResource({ accessToken });
  }
}
