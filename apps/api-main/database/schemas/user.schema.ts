import { relations } from 'drizzle-orm';
import { pgTable, serial, timestamp, uuid, varchar } from 'drizzle-orm/pg-core';

import { post } from './post.schema';

export const user = pgTable('users', {
  id: serial('id').primaryKey(),
  uuid: uuid('uuid'),
  email: varchar('email', { length: 255 }).notNull().unique(),
  password: varchar('password', { length: 255 }).notNull(),
  username: varchar('username', { length: 255 }).notNull(),
  firstname: varchar('firstname'),
  lastname: varchar('lastname'),
  socialId: varchar('social_id'),
  socialProvider: varchar('social_provider'),
  bannedAt: timestamp('banned_at').defaultNow(),
  lastLoginAt: timestamp('last_login_at'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const userRelations = relations(user, ({ many }) => ({
  posts: many(post),
}));
