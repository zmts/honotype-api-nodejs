import { db, user } from '@api-main/database';
import { eq } from 'drizzle-orm';

import { AppError, ErrorCode } from '@libs/common/errors';
import { uuid7 } from '@libs/common/utils';
import { IRepository } from '@libs/core';
import { User } from '@libs/entities';

export class UsersRepo implements IRepository<User> {
  async create(data: User): Promise<User> {
    try {
      data.uuid = uuid7();
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

  async findOneById(id: number): Promise<any> {
    try {
      const result = await db.query.user.findFirst({
        where: (user, { eq }) => eq(user.id, id),
      });
      return result ? new User(result) : null;
    } catch (error) {
      throw new AppError(ErrorCode.DB, { error });
    }
  }

  async findOneByUuid(uuid: string): Promise<User> {
    try {
      const [result] = await db.select().from(user).where(eq(user.uuid, uuid)).limit(1);
      return result ? new User(result) : null;
    } catch (error) {
      throw new AppError(ErrorCode.DB, { error });
    }
  }

  async findOneByEmail(email: string): Promise<User> {
    try {
      const [result] = await db.select().from(user).where(eq(user.email, email)).limit(1);
      return result ? new User(result) : null;
    } catch (error) {
      throw new AppError(ErrorCode.DB, { error });
    }
  }

  async findOrCreateByEmail(data: User): Promise<User> {
    try {
      let [result] = await db.select().from(user).where(eq(user.email, data.email)).limit(1);
      if (!result) {
        result = await this.create(data);
      }

      return new User(result);
    } catch (error) {
      throw new AppError(ErrorCode.DB, { error });
    }
  }

  async find(/*filter: { [p: string]: any }*/): Promise<User[]> {
    try {
      const result = await db.select().from(user);
      return result.length ? result.map(i => new User(i)) : [];
    } catch (error) {
      throw new AppError(ErrorCode.DB, { error });
    }
  }
}
