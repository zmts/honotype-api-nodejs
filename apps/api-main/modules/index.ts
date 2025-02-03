import { IBaseController } from '@libs/core';

import { RootController } from './root';
import { UsersController } from './users';

export const controllers: (new () => IBaseController)[] = [RootController, UsersController];
