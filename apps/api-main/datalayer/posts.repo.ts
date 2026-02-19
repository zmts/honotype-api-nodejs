import { db, post } from '@api-main/database';
import { and, count, eq, SQL } from 'drizzle-orm';

import { uuid7 } from '@libs/common/utils';
import { IFindOptions, IPageResult, IRepository } from '@libs/core';
import { Post } from '@libs/entities';

import { BaseRepo } from './';

export class PostsRepo extends BaseRepo implements IRepository<Post> {
  async create(data: Post): Promise<Post> {
    try {
      data.uuid = uuid7();
      const [result] = await db.insert(post).values(data).returning();
      return new Post(result);
    } catch (error) {
      throw this.handleDbError(error);
    }
  }

  async update(entity: Partial<Post>): Promise<Post> {
    try {
      const [result] = await db.update(post).set(entity).where(eq(post.id, entity.id)).returning();
      return new Post(result);
    } catch (error) {
      throw this.handleDbError(error);
    }
  }

  async findOneById(id: number): Promise<any> {
    try {
      const result = await db.query.post.findFirst({
        where: (post, { eq }) => eq(post.id, id),
      });
      return result ? new Post(result) : null;
    } catch (error) {
      throw this.handleDbError(error);
    }
  }

  async findOneByUuid(uuid: string): Promise<Post> {
    try {
      const result = await db.query.post.findFirst({
        where: (post, { eq }) => eq(post.uuid, uuid),
      });
      return result ? new Post(result) : null;
    } catch (error) {
      throw this.handleDbError(error);
    }
  }

  async findAll(options: Omit<IFindOptions<Post>, 'pagination'>): Promise<Post[]> {
    const { filter } = this.findOptions<Post>(options);
    try {
      const where = this.buildWhere(filter);
      const result = where ? await db.select().from(post).where(where) : await db.select().from(post);
      return result.length ? result.map(i => new Post(i)) : [];
    } catch (error) {
      throw this.handleDbError(error);
    }
  }

  async findAndPaginate(options: IFindOptions<Post>): Promise<IPageResult<Post>> {
    try {
      const { pagination, filter } = this.findOptions<Post>(options);
      const where = this.buildWhere(filter);

      const queryItems = where
        ? db.select().from(post).where(where).limit(pagination.limit).offset(pagination.offset)
        : db.select().from(post).limit(pagination.limit).offset(pagination.offset);

      const queryTotal = where
        ? db.select({ total: count() }).from(post).where(where)
        : db.select({ total: count() }).from(post);

      const [rows, totalRow] = await Promise.all([queryItems, queryTotal]);
      const total = this.getQueryTotal(totalRow);

      return {
        items: rows.map(r => new Post(r)),
        pagination: { limit: pagination.limit, total },
      };
    } catch (error) {
      throw this.handleDbError(error);
    }
  }

  private buildWhere(filter?: Partial<Post>): SQL<unknown> | undefined {
    const conditions: SQL<unknown>[] = [];
    if (typeof filter?.userId) {
      conditions.push(eq(post.userId, filter.userId));
    }
    if (filter?.title) {
      conditions.push(eq(post.title, filter.title));
    }
    if (filter?.uuid) {
      conditions.push(eq(post.uuid, filter.uuid));
    }
    if (filter?.description) {
      conditions.push(eq(post.description, filter.description));
    }
    return conditions.length ? and(...conditions) : undefined;
  }
}
