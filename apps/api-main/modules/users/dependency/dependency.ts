import { UsersRepo } from '@api-main/datalayer';

import { IUsersDependency } from './';

export const dependency: IUsersDependency = {
  usersRepo: new UsersRepo(),
};
