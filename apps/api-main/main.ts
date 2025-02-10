import process from 'node:process';

import { knexConfig } from '@api-main/database';

import { migrationsRunner } from '@libs/core';

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
