import ms from 'ms';

import { AppError, ErrorCode } from '@libs/common/errors';
import { RefreshSession } from '@libs/entities';

import { IAuthDependency } from '../dependency';

const MAX_REFRESH_SESSIONS_COUNT = 5;

export class AuthService {
  constructor(
    deps: Pick<IAuthDependency, 'refreshSessionsRepo' | 'authConfig'>,
    private authConfig = deps.authConfig,
    private refreshSessionsRepo = deps.refreshSessionsRepo,
  ) {}

  getRefreshTokenTimeIntervals(): { expiresInMs: number; cookieMaxAgeSec: number } {
    const intervalMs = ms(this.authConfig.refreshToken.expiresIn);
    const expiresInMs = Date.now() + intervalMs;
    return { expiresInMs, cookieMaxAgeSec: Math.floor(intervalMs / 1000) };
  }

  buildRefreshSessionEntity(params: {
    userId: number;
    fingerprint: string;
    expiresIn: number;
    ip?: string;
    ua?: string | null;
  }): RefreshSession {
    const model = new RefreshSession({
      userId: params.userId,
      fingerprint: params.fingerprint,
      expiresIn: params.expiresIn,
      ip: params.ip ?? null,
      ua: params.ua ?? null,
    });
    return model;
  }

  async addRefreshSession(refreshSession: RefreshSession): Promise<RefreshSession> {
    const existingSessionsCount = await this.refreshSessionsRepo.getCountByUserId(refreshSession.userId);
    if (existingSessionsCount >= MAX_REFRESH_SESSIONS_COUNT) {
      await this.refreshSessionsRepo.removeByUserId(refreshSession.userId);
    }
    return this.refreshSessionsRepo.create(refreshSession);
  }

  verifyRefreshSession(oldRefreshSession: RefreshSession, newFingerprint: string): void {
    const nowTime = new Date().getTime();
    if (nowTime > oldRefreshSession.expiresIn) {
      throw new AppError(ErrorCode.SESSION_EXPIRED);
    }
    // if (oldIp !== newIp) {
    //   throw new AppError(ErrorCode.INVALID_SESSION);
    // }
    if (oldRefreshSession.fingerprint !== newFingerprint) {
      throw new AppError(ErrorCode.INVALID_SESSION);
    }
  }
}
