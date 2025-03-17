import { sql } from 'drizzle-orm';
import { integer, sqliteTable, text } from 'drizzle-orm/sqlite-core';

export const conversations = sqliteTable('conversations', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text('updated_at').default(sql`CURRENT_TIMESTAMP`),
});

export const messages = sqliteTable('messages', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  conversationId: integer('conversation_id').references(() => conversations.id),
  role: text('role', { enum: ['user', 'assistant', 'tool'] }),
  content: text('content'),
  name: text('name'),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
});

export const tripPlans = sqliteTable('trip_plans', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  conversationId: integer('conversation_id').references(() => conversations.id),
  destination: text('destination').notNull(),
  startDate: text('start_date').notNull(),
  endDate: text('end_date').notNull(),
  tags: text('tags').notNull(), // We'll store as JSON string
  days: text('days').notNull(), // We'll store as JSON string
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
});
