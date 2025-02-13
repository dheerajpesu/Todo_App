import { tasks, type Task, type InsertTask } from "@shared/schema";
import { startOfDay } from "date-fns";

export interface IStorage {
  getTasks(): Promise<Task[]>;
  createTask(task: InsertTask): Promise<Task>;
  updateTask(id: number, completed: boolean): Promise<Task | undefined>;
  deleteTask(id: number): Promise<boolean>;
  resetFixedTasks(): Promise<void>;
}

export class MemStorage implements IStorage {
  private tasks: Map<number, Task>;
  private currentId: number;

  constructor() {
    this.tasks = new Map();
    this.currentId = 1;
  }

  async getTasks(): Promise<Task[]> {
    return Array.from(this.tasks.values());
  }

  async createTask(insertTask: InsertTask): Promise<Task> {
    const id = this.currentId++;
    const task: Task = {
      ...insertTask,
      id,
      lastReset: new Date(),
    };
    this.tasks.set(id, task);
    return task;
  }

  async updateTask(id: number, completed: boolean): Promise<Task | undefined> {
    const task = this.tasks.get(id);
    if (!task) return undefined;
    
    const updatedTask = { ...task, completed };
    this.tasks.set(id, updatedTask);
    return updatedTask;
  }

  async deleteTask(id: number): Promise<boolean> {
    return this.tasks.delete(id);
  }

  async resetFixedTasks(): Promise<void> {
    const today = startOfDay(new Date());
    
    for (const task of this.tasks.values()) {
      if (task.isFixed && startOfDay(task.lastReset) < today) {
        this.tasks.set(task.id, {
          ...task,
          completed: false,
          lastReset: today
        });
      }
    }
  }
}

export const storage = new MemStorage();
