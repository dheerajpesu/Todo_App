import { pgTable, text, serial, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const tasks = pgTable("tasks", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  completed: boolean("completed").notNull().default(false),
  isFixed: boolean("is_fixed").notNull().default(false),
  lastReset: timestamp("last_reset").notNull().default(new Date()),
});

export const insertTaskSchema = createInsertSchema(tasks)
  .omit({ id: true, lastReset: true })
  .extend({
    title: z.string().min(1, "Title is required").max(100, "Title too long"),
  });

export type InsertTask = z.infer<typeof insertTaskSchema>;
export type Task = typeof tasks.$inferSelect;
