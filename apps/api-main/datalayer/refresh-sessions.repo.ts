import { db } from '@api-main/database';
import { refreshSession } from '@api-main/database/schemas';
import { count, eq } from 'drizzle-orm';

import { RefreshSession } from '@libs/entities';

import { BaseRepo } from './';

export class RefreshSessionsRepo extends BaseRepo {
  async create(data: RefreshSession): Promise<RefreshSession> {
    try {
      const [result] = await db.insert(refreshSession).values(data).returning();
      return new RefreshSession(result);
    } catch (error) {
      throw this.handleDbError(error);
    }
  }

  async getByRefreshToken(refreshToken: string): Promise<RefreshSession> {
    const result = await db.query.refreshSession.findFirst({
      where: (refreshSession, { eq }) => eq(refreshSession.refreshToken, refreshToken),
    });
    if (result) return new RefreshSession(result);
    throw this.errorEmptyResponse();
  }

  async getCountByUserId(userId: number): Promise<number> {
    try {
      const [result] = await db
        .select({ total: count() })
        .from(refreshSession)
        .where(eq(refreshSession.userId, userId));
      return result?.total ?? 0;
    } catch (error) {
      throw this.handleDbError(error);
    }
  }

  async removeByUserId(userId: number): Promise<void> {
    try {
      await db.delete(refreshSession).where(eq(refreshSession.userId, userId));
    } catch (error) {
      throw this.handleDbError(error);
    }
  }

  async removeByRefreshToken(refreshToken: string): Promise<void> {
    try {
      await db.delete(refreshSession).where(eq(refreshSession.refreshToken, refreshToken));
    } catch (error) {
      throw this.handleDbError(error);
    }
  }
}
