import { UsersRepo } from '@api-main/datalayer';

import { IDependency } from './';

export const dependency: IDependency = {
  usersRepo: new UsersRepo(),
};
