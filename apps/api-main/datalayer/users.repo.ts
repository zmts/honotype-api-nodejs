import { db, user } from '@api-main/database';
import { BaseRepo } from '@api-main/datalayer/base.repo';
import { and, eq, or, SQL } from 'drizzle-orm';

import { uuid7 } from '@libs/common/utils';
import { IFindOptions, IRepository } from '@libs/core';
import { Post, User } from '@libs/entities';

export class UsersRepo extends BaseRepo implements IRepository<User> {
  async create(data: User): Promise<User> {
    try {
      data.uuid = uuid7();
      const [result] = await db.insert(user).values(data).returning();
      return new User(result);
    } catch (error) {
      throw this.handleDbError(error);
    }
  }
  async update(entity: Partial<User>): Promise<User> {
    try {
      const [result] = await db.update(user).set(entity).where(eq(user.id, entity.id)).returning();
      return new User(result);
    } catch (error) {
      throw this.handleDbError(error);
    }
  }

  async findOne(filter: Partial<Pick<User, 'id' | 'uuid' | 'email'>>): Promise<User | null> {
    try {
      const where = this.buildWhere(filter);
      const [result] = await db.select().from(user).where(where).limit(1);
      return result ? new User(result) : null;
    } catch (error) {
      throw this.handleDbError(error);
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
      throw this.handleDbError(error);
    }
  }

  async findAll(options: Omit<IFindOptions<User>, 'pagination'>): Promise<User[]> {
    const { filter } = this.findOptions<Post>(options);
    try {
      const where = this.buildWhere(filter);
      const result = where ? await db.select().from(user).where(where) : await db.select().from(user);
      return result.length ? result.map(i => new User(i)) : [];
    } catch (error) {
      throw this.handleDbError(error);
    }
  }

  private buildWhere(filter?: Partial<User>, operator: 'and' | 'or' = 'and'): SQL<unknown> | undefined {
    const op = operator === 'and' ? and : or;
    const conditions: SQL<unknown>[] = [];

    if (filter?.id) {
      conditions.push(eq(user.id, filter.id));
    }
    if (filter?.uuid) {
      conditions.push(eq(user.uuid, filter.uuid));
    }
    if (filter?.email) {
      conditions.push(eq(user.email, filter.email));
    }

    return conditions.length ? op(...conditions) : undefined;
  }
}
