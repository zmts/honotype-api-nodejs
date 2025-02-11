import process from 'node:process';

import { migrationsRunner } from '@libs/core';

import { knexConfig } from './database';
import { server } from './server';

async function start(): Promise<void> {
  if (process.argv.includes('--migrations')) {
    await migrationsRunner(knexConfig);
  } else {
    await server();
  }
}

start().catch(e => {
  throw e;
});
