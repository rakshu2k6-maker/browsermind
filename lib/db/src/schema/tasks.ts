import { pgTable, text, serial, timestamp, integer, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const tasksTable = pgTable("tasks", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  instruction: text("instruction").notNull(),
  targetUrl: text("target_url"),
  status: text("status").notNull().default("pending"),
  outputFormat: text("output_format").notNull().default("json"),
  maxRetries: integer("max_retries").notNull().default(3),
  timeoutSeconds: integer("timeout_seconds").notNull().default(60),
  executionTime: integer("execution_time"),
  stepCount: integer("step_count").notNull().default(0),
  extractedData: text("extracted_data"),
  transcript: text("transcript"),
  errorMessage: text("error_message"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  startedAt: timestamp("started_at", { withTimezone: true }),
  completedAt: timestamp("completed_at", { withTimezone: true }),
});

export const insertTaskSchema = createInsertSchema(tasksTable).omit({
  id: true,
  createdAt: true,
  startedAt: true,
  completedAt: true,
  executionTime: true,
  stepCount: true,
});
export type InsertTask = z.infer<typeof insertTaskSchema>;
export type Task = typeof tasksTable.$inferSelect;

export const taskStepsTable = pgTable("task_steps", {
  id: serial("id").primaryKey(),
  taskId: integer("task_id").notNull().references(() => tasksTable.id, { onDelete: "cascade" }),
  stepNumber: integer("step_number").notNull(),
  action: text("action").notNull(),
  target: text("target"),
  input: text("input"),
  status: text("status").notNull().default("success"),
  screenshotUrl: text("screenshot_url"),
  reasoning: text("reasoning"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertTaskStepSchema = createInsertSchema(taskStepsTable).omit({
  id: true,
  createdAt: true,
});
export type InsertTaskStep = z.infer<typeof insertTaskStepSchema>;
export type TaskStep = typeof taskStepsTable.$inferSelect;
