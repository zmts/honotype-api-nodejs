import { IResponseOptions, Resource } from '@libs/common/api';
import { Post } from '@libs/entities';

import { PostContract } from '../contracts';

export class PostResource extends Resource<PostContract> {
  constructor(
    private item: Post,
    private responseOptions: IResponseOptions = {},
  ) {
    super();
  }

  options(): IResponseOptions {
    return this.responseOptions;
  }

  result(): PostContract {
    return {
      uuid: this.item.uuid,
      title: this.item.title,
      description: this.item.description,
    };
  }
}
