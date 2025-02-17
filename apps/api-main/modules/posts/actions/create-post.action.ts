import { CurrentUserJwt } from '@libs/common/jwt';
import { BaseAction } from '@libs/core';
import { Post } from '@libs/entities';

import { IDependency } from '../dependency';
import { CreatePostDto, PostResource } from '../inout';

export class CreatePostAction extends BaseAction<[CreatePostDto, CurrentUserJwt], PostResource> {
  constructor(
    deps: IDependency,
    private postsRepo = deps.postsRepo,
  ) {
    super();
  }

  async run(dto: CreatePostDto, currentUser: CurrentUserJwt): Promise<PostResource> {
    const post = await this.postsRepo.create(new Post({ ...dto, userId: currentUser.id }));
    return new PostResource(post);
  }
}
