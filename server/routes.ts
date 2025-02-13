import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertTaskSchema } from "@shared/schema";
import { z } from "zod";

export function registerRoutes(app: Express): Server {
  // Reset fixed tasks on server start
  storage.resetFixedTasks();
  
  // Set up daily reset at midnight
  setInterval(async () => {
    const now = new Date();
    if (now.getHours() === 0 && now.getMinutes() === 0) {
      await storage.resetFixedTasks();
    }
  }, 60000); // Check every minute

  app.get("/api/tasks", async (_req, res) => {
    const tasks = await storage.getTasks();
    res.json(tasks);
  });

  app.post("/api/tasks", async (req, res) => {
    try {
      const task = insertTaskSchema.parse(req.body);
      const created = await storage.createTask(task);
      res.status(201).json(created);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: error.errors[0].message });
      } else {
        res.status(500).json({ message: "Failed to create task" });
      }
    }
  });

  app.patch("/api/tasks/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    const completed = req.body.completed;
    
    if (typeof completed !== "boolean") {
      return res.status(400).json({ message: "Invalid completed status" });
    }

    const updated = await storage.updateTask(id, completed);
    if (!updated) {
      return res.status(404).json({ message: "Task not found" });
    }
    
    res.json(updated);
  });

  app.delete("/api/tasks/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    const deleted = await storage.deleteTask(id);
    
    if (!deleted) {
      return res.status(404).json({ message: "Task not found" });
    }
    
    res.status(204).send();
  });

  return createServer(app);
}
