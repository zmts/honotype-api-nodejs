import { ResourceList } from '@libs/common/api';
import { CurrentUserJwt } from '@libs/common/jwt';
import { BaseAction } from '@libs/core';

import { IDependency } from '../dependency';
import { PostContract, PostResource } from '../inout';

export class ListPostsAction extends BaseAction<[CurrentUserJwt], ResourceList<PostContract>> {
  constructor(
    deps: IDependency,
    private postsRepo = deps.postsRepo,
  ) {
    super();
  }

  async run(currentUser: CurrentUserJwt): Promise<ResourceList<PostContract>> {
    const { items, pagination } = await this.postsRepo.findAndPaginate({ filter: { userId: currentUser.id } });
    return PostResource.list<PostContract>(items, { pagination });
  }
}
