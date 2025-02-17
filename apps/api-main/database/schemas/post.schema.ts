import { relations } from 'drizzle-orm';
import { pgTable, serial, timestamp, uuid, varchar, integer } from 'drizzle-orm/pg-core';

import { user } from './user.schema';

export const post = pgTable('posts', {
  id: serial('id').primaryKey(),
  uuid: uuid('uuid').notNull(),
  userId: integer('user_id').references(() => user.id),
  title: varchar('title'),
  description: varchar('description'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const postRelations = relations(post, ({ one }) => ({
  user: one(user, {
    fields: [post.userId],
    references: [user.id],
  }),
}));
