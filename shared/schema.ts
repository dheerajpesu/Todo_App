import { z } from "zod";
import mongoose from "mongoose";

// Zod schema for validation
export const insertTaskSchema = z.object({
  title: z.string().min(1, "Title is required").max(100, "Title too long"),
  completed: z.boolean().default(false),
  isFixed: z.boolean().default(false),
});

export type InsertTask = z.infer<typeof insertTaskSchema>;

// Mongoose schema
const taskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  completed: { type: Boolean, default: false },
  isFixed: { type: Boolean, default: false },
  lastReset: { type: Date, default: Date.now }
});

export const Task = mongoose.model('Task', taskSchema);

// Export the document type for TypeScript
export type TaskType = mongoose.Document & {
  _id: string;
  title: string;
  completed: boolean;
  isFixed: boolean;
  lastReset: Date;
};