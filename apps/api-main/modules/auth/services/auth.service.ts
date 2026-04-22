import ms from 'ms';

import { AppError, ErrorCode } from '@libs/core';
import { RefreshSession } from '@libs/entities';

import { IAuthDependency } from '../dependency';

const MAX_REFRESH_SESSIONS_COUNT = 5;

export class AuthService {
  constructor(
    deps: Pick<IAuthDependency, 'refreshSessionsRepo' | 'authConfig'>,
    private authConfig = deps.authConfig,
    private refreshSessionsRepo = deps.refreshSessionsRepo,
  ) {}

  getRefreshTokenTimeIntervals(): { expiresAtMs: number; cookieMaxAgeSec: number } {
    const expiringPeriodMs = ms(this.authConfig.refreshToken.expiringPeriod);
    const expiresAtMs = Date.now() + expiringPeriodMs;
    return { expiresAtMs, cookieMaxAgeSec: Math.floor(expiringPeriodMs / 1000) };
  }

  buildRefreshSessionEntity(params: {
    userId: number;
    fingerprint: string;
    expiresAtMs: number;
    ip?: string;
    ua?: string | null;
  }): RefreshSession {
    const model = new RefreshSession({
      userId: params.userId,
      fingerprint: params.fingerprint,
      expiresAtMs: params.expiresAtMs,
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
    const nowTimeMs = new Date().getTime();
    if (nowTimeMs > oldRefreshSession.expiresAtMs) {
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
