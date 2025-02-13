import mongoose from 'mongoose';
import { Task as TaskType, type InsertTask } from "@shared/schema";
import { startOfDay } from "date-fns";

export interface IStorage {
  getTasks(): Promise<typeof TaskType[]>;
  createTask(task: InsertTask): Promise<typeof TaskType>;
  updateTask(id: string, completed: boolean): Promise<typeof TaskType | null>;
  deleteTask(id: string): Promise<boolean>;
  resetFixedTasks(): Promise<void>;
}

export class MongoStorage implements IStorage {
  constructor() {
    // Connect to MongoDB with better error handling
    const MONGODB_URL = process.env.MONGODB_URL || 'mongodb://0.0.0.0:27017/todoapp';

    mongoose.connect(MONGODB_URL, {
      serverSelectionTimeoutMS: 5000, // 5 seconds timeout
      connectTimeoutMS: 10000,
      socketTimeoutMS: 45000,
    }).then(() => {
      console.log('✅ Connected to MongoDB successfully');
    }).catch(err => {
      console.error('❌ MongoDB connection error:', err);
      process.exit(1); // Exit if we can't connect to MongoDB
    });

    // Handle connection errors after initial connect
    mongoose.connection.on('error', err => {
      console.error('MongoDB connection error:', err);
    });

    // Log when connection is disconnected
    mongoose.connection.on('disconnected', () => {
      console.log('MongoDB disconnected');
    });
  }

  async getTasks(): Promise<typeof TaskType[]> {
    return await TaskType.find().sort({ lastReset: -1 });
  }

  async createTask(insertTask: InsertTask): Promise<typeof TaskType> {
    const task = new TaskType({
      ...insertTask,
      lastReset: new Date()
    });
    return await task.save();
  }

  async updateTask(id: string, completed: boolean): Promise<typeof TaskType | null> {
    return await TaskType.findByIdAndUpdate(
      id,
      { completed },
      { new: true }
    );
  }

  async deleteTask(id: string): Promise<boolean> {
    const result = await TaskType.deleteOne({ _id: id });
    return result.deletedCount > 0;
  }

  async resetFixedTasks(): Promise<void> {
    const today = startOfDay(new Date());
    await TaskType.updateMany(
      {
        isFixed: true,
        lastReset: { $lt: today }
      },
      {
        $set: {
          completed: false,
          lastReset: today
        }
      }
    );
  }
}

export const storage = new MongoStorage();