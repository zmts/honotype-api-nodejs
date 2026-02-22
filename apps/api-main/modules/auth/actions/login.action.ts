import { Cookie } from '@libs/common/api';
import { AppError, ErrorCode } from '@libs/common/errors';
import { BaseAction } from '@libs/core';
import { User } from '@libs/entities';

import { IAuthDependency } from '../dependency';
import { LoginDto, AuthResource } from '../inout';

export class LoginAction extends BaseAction<[LoginDto], AuthResource> {
  constructor(
    deps: IAuthDependency,
    private usersRepo = deps.usersRepo,
    private jwtService = deps.jwtService,
    private authService = deps.authService,
  ) {
    super();
  }

  async run(dto: LoginDto): Promise<AuthResource> {
    const user = await this.usersRepo.findOne({ email: dto.email });

    if (!user) {
      throw new AppError(ErrorCode.INVALID_CREDENTIALS);
    }

    const isValid = await User.checkPassword({ password: dto.password, hash: user.password });
    if (!isValid) {
      throw new AppError(ErrorCode.INVALID_CREDENTIALS);
    }

    const { expiresInMs, cookieMaxAgeSec } = this.authService.getRefreshTokenTimeIntervals();
    const newRefSession = this.authService.buildRefreshSessionEntity({
      userId: user.id,
      fingerprint: dto.fingerprint,
      expiresIn: expiresInMs,
    });

    await this.authService.addRefreshSession(newRefSession);

    const accessToken = this.jwtService.sigh({ id: user.id, uuid: user.uuid });

    return new AuthResource(
      { accessToken, refreshToken: newRefSession.refreshToken },
      {
        cookies: [
          new Cookie({
            name: 'refreshToken',
            value: newRefSession.refreshToken,
            path: '/api/auth',
            maxAge: cookieMaxAgeSec,
          }),
        ],
      },
    );
  }
}
