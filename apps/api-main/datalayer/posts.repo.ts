import { db, post } from '@api-main/database';
import { eq } from 'drizzle-orm';

import { AppError, ErrorCode } from '@libs/common/errors';
import { uuid7 } from '@libs/common/utils';
import { IRepository } from '@libs/core';
import { Post } from '@libs/entities';

export class PostsRepo implements IRepository<Post> {
  async create(data: Post): Promise<Post> {
    try {
      data.uuid = uuid7();
      const [result] = await db.insert(post).values(data).returning();
      return new Post(result);
    } catch (error) {
      throw new AppError(ErrorCode.DB, { error });
    }
  }
  async update(entity: Partial<Post>): Promise<Post> {
    try {
      const [result] = await db.update(post).set(entity).where(eq(post.id, entity.id)).returning();
      return new Post(result);
    } catch (error) {
      throw new AppError(ErrorCode.DB, { error });
    }
  }

  async findOneById(id: number): Promise<any> {
    try {
      const result = await db.query.post.findFirst({
        where: (post, { eq }) => eq(post.id, id),
      });
      return result ? new Post(result) : null;
    } catch (error) {
      throw new AppError(ErrorCode.DB, { error });
    }
  }

  async findOneByUuid(uuid: string): Promise<Post> {
    try {
      const result = await db.query.post.findFirst({
        where: (post, { eq }) => eq(post.uuid, uuid),
      });
      return result ? new Post(result) : null;
    } catch (error) {
      throw new AppError(ErrorCode.DB, { error });
    }
  }

  async find(/*filter: { [p: string]: any }*/): Promise<Post[]> {
    try {
      const result = await db.select().from(post);
      return result.length ? result.map(i => new Post(i)) : [];
    } catch (error) {
      throw new AppError(ErrorCode.DB, { error });
    }
  }
}
