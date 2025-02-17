import { UserId } from '@libs/common/types/global';

import { BaseEntity } from './base.entity';

interface IPost {
  id: number;
  uuid: string;
  userId: UserId;
  title: string;
  description: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Post extends IPost {}
export class Post extends BaseEntity<Partial<IPost>> {}
