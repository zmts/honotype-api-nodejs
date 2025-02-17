import { PostsRepo } from '@api-main/datalayer';

import { IDependency } from './';

export const dependency: IDependency = {
  postsRepo: new PostsRepo(),
};
