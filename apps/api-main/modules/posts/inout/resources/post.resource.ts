import { Resource } from '@libs/common/api';
import { Post } from '@libs/entities';

import { PostContract } from '../contracts';

export class PostResource extends Resource<PostContract> {
  constructor(private item: Post) {
    super();
  }

  result(): PostContract {
    return {
      uuid: this.item.uuid,
      title: this.item.title,
      description: this.item.description,
    };
  }
}
