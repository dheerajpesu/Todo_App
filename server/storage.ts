import mongoose from 'mongoose';
import { Task, type InsertTask } from "@shared/schema";
import { startOfDay } from "date-fns";

export interface IStorage {
  getTasks(): Promise<any[]>;
  createTask(task: InsertTask): Promise<any>;
  updateTask(id: string, completed: boolean): Promise<any | null>;
  deleteTask(id: string): Promise<boolean>;
  resetFixedTasks(): Promise<void>;
}

export class MongoStorage implements IStorage {
  private initialized: boolean = false;

  constructor() {
    this.initialize();
  }

  private async initialize() {
    try {
      const MONGODB_URL = process.env.MONGODB_URL || 'mongodb://localhost:27017/todoapp';

      await mongoose.connect(MONGODB_URL, {
        serverSelectionTimeoutMS: 30000, // 30 seconds
        connectTimeoutMS: 30000,
        socketTimeoutMS: 45000,
        maxPoolSize: 10,
        minPoolSize: 1,
      });

      console.log('✅ Connected to MongoDB successfully');
      this.initialized = true;

      // Reset fixed tasks on successful connection
      await this.resetFixedTasks();
    } catch (err) {
      console.error('❌ MongoDB connection error:', err);
      throw err;
    }

    mongoose.connection.on('error', err => {
      console.error('MongoDB connection error:', err);
      this.initialized = false;
    });

    mongoose.connection.on('disconnected', () => {
      console.log('MongoDB disconnected');
      this.initialized = false;
    });
  }

  private async ensureConnection() {
    if (!this.initialized) {
      await this.initialize();
    }
  }

  async getTasks(): Promise<any[]> {
    await this.ensureConnection();
    return await Task.find().sort({ lastReset: -1 });
  }

  async createTask(insertTask: InsertTask): Promise<any> {
    await this.ensureConnection();
    const task = new Task({
      ...insertTask,
      lastReset: new Date()
    });
    return await task.save();
  }

  async updateTask(id: string, completed: boolean): Promise<any | null> {
    await this.ensureConnection();
    return await Task.findByIdAndUpdate(
      id,
      { completed },
      { new: true }
    );
  }

  async deleteTask(id: string): Promise<boolean> {
    await this.ensureConnection();
    const result = await Task.deleteOne({ _id: id });
    return result.deletedCount > 0;
  }

  async resetFixedTasks(): Promise<void> {
    await this.ensureConnection();
    const today = startOfDay(new Date());
    await Task.updateMany(
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