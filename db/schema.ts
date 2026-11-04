// Intentionally empty by default.
// Add Drizzle tables here when the site actually needs a database.
// See examples/d1/db/schema.ts for an opt-in example.
import { sqliteTable, text, integer } from 'drizzle-orm/sqlite-core';
export const workspaces = sqliteTable('workspaces', {
 ownerId:text('owner_id').primaryKey(), version:integer('version').notNull().default(0),
 body:text('body').notNull(), updatedAt:text('updated_at').notNull()
});

export const recommendations = sqliteTable('recommendations', {
  id: text('id').primaryKey(),
  ownerId: text('owner_id').notNull(),
  productId: text('product_id').notNull(),
  kind: text('kind').notNull(),
  risk: text('risk').notNull(),
  payload: text('payload').notNull(),
  status: text('status').notNull().default('pending'),
  createdAt: text('created_at').notNull(),
  resolvedAt: text('resolved_at'),
});
