import { Cookie } from '@libs/common/api';
import { SymmetricJwtService } from '@libs/common/jwt';
import { BaseAction } from '@libs/core';

import { IAuthDependency } from '../dependency';
import { RefreshTokenDto, AuthResource } from '../inout';

export class RefreshTokensAction extends BaseAction<[RefreshTokenDto], AuthResource> {
  constructor(
    deps: IAuthDependency,
    private usersRepo = deps.usersRepo,
    private jwtService: SymmetricJwtService = deps.jwtService,
    private authService = deps.authService,
    private refreshSessionsRepo = deps.refreshSessionsRepo,
  ) {
    super();
  }

  async run(dto: RefreshTokenDto): Promise<AuthResource> {
    const { fingerprint, refreshToken: reqRefreshToken } = dto;

    const oldRefreshSession = await this.refreshSessionsRepo.getByRefreshToken(reqRefreshToken);
    await this.refreshSessionsRepo.removeByRefreshToken(reqRefreshToken);
    this.authService.verifyRefreshSession(oldRefreshSession, fingerprint);

    const user = await this.usersRepo.findOne({ id: oldRefreshSession.userId });

    const { expiresInMs, cookieMaxAgeSec } = this.authService.getRefreshTokenTimeIntervals();
    const newRefSessionEntity = this.authService.buildRefreshSessionEntity({
      userId: user.id,
      fingerprint,
      expiresIn: expiresInMs,
    });

    await this.authService.addRefreshSession(newRefSessionEntity);

    const accessToken = this.jwtService.sigh({ uuid: user.uuid });

    return new AuthResource(
      { accessToken, refreshToken: newRefSessionEntity.refreshToken },
      {
        cookies: [
          new Cookie({
            name: 'refreshToken',
            value: newRefSessionEntity.refreshToken,
            path: '/api/auth',
            maxAge: cookieMaxAgeSec,
          }),
        ],
      },
    );
  }
}
