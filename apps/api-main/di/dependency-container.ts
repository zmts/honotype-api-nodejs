import { Ioc } from 'libs/core';

import { tokens } from './tokens';
export const ioc = new Ioc(new Map([[tokens.SomeService, {}]]));
