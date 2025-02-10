import { db } from '@api-main/database';
import { user } from '@api-main/database';
import { eq } from 'drizzle-orm';

import { AppError, ErrorCode } from '@libs/common/errors';
import { IRepository } from '@libs/core';
import { User } from '@libs/entities';

export class UsersRepo implements IRepository<User> {
  async create(data: User): Promise<User> {
    try {
      const [result] = await db.insert(user).values(data).returning();
      return new User(result);
    } catch (error) {
      throw new AppError(ErrorCode.DB, { error });
    }
  }
  async update(entity: Partial<User>): Promise<User> {
    try {
      const [result] = await db.update(user).set(entity).where(eq(user.id, entity.id)).returning();
      return new User(result);
    } catch (error) {
      throw new AppError(ErrorCode.DB, { error });
    }
  }

  async findById(id: number): Promise<User> {
    try {
      const [result] = await db.select().from(user).where(eq(user.id, id)).limit(1);
      return result ? new User(result) : null;
    } catch (error) {
      throw new AppError(ErrorCode.DB, { error });
    }
  }
}
