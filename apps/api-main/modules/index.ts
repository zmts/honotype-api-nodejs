import { IBaseController } from '@libs/core';

import { AuthController } from './auth';
import { RootController } from './root';
import { UsersController } from './users';

export const controllers: (new () => IBaseController)[] = [RootController, AuthController, UsersController];
