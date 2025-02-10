import { UsersRepo } from '@api-main/datalayer';

import { IUsersDependency } from './interface';

export const container: IUsersDependency = {
  usersRepo: new UsersRepo(),
};
