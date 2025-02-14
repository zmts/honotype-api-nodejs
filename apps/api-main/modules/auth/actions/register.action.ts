import { AppError, ErrorCode } from '@libs/common/errors';
import { BaseAction } from '@libs/core';
import { User } from '@libs/entities';
import { SuccessResource } from '@libs/shared/inout';

import { IAuthDependency } from '../dependency';
import { RegisterDto } from '../inout';

export class RegisterAction extends BaseAction<[RegisterDto], SuccessResource> {
  constructor(
    deps: IAuthDependency,
    private usersRepo = deps.usersRepo,
  ) {
    super();
  }

  async run(dto: RegisterDto): Promise<SuccessResource> {
    const isExist = await this.usersRepo.findOneByEmail(dto.email);
    if (isExist) {
      throw new AppError(ErrorCode.CONFLICT);
    }

    const user = new User({ ...dto, password: await User.hashPassword({ password: dto.password }) });
    await this.usersRepo.create(user);

    return new SuccessResource();
  }
}
