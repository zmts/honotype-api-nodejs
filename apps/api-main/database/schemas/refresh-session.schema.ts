import { pgTable, serial, timestamp, uuid, varchar, integer, bigint } from 'drizzle-orm/pg-core';

import { user } from './user.schema';

export const refreshSession = pgTable('refresh_sessions', {
  id: serial('id').primaryKey(),
  userId: integer('user_id')
    .notNull()
    .references(() => user.id),
  refreshToken: uuid('refresh_token').notNull(),
  ua: varchar('ua', { length: 200 }),
  fingerprint: varchar('fingerprint', { length: 200 }),
  ip: varchar('ip', { length: 45 }),
  expiresIn: bigint('expires_in', { mode: 'number' }).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});
