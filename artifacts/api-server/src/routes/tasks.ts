import { Router, type IRouter } from "express";
import { eq, desc, ilike, or, sql } from "drizzle-orm";
import { db, tasksTable, taskStepsTable } from "@workspace/db";
import {
  ListTasksQueryParams,
  CreateTaskBody,
  GetTaskParams,
  DeleteTaskParams,
  ExecuteTaskParams,
  PauseTaskParams,
  ResumeTaskParams,
  StopTaskParams,
} from "@workspace/api-zod";
import { logger } from "../lib/logger";

const router: IRouter = Router();

router.get("/tasks/recent", async (_req, res): Promise<void> => {
  const tasks = await db
    .select()
    .from(tasksTable)
    .orderBy(desc(tasksTable.createdAt))
    .limit(5);
  res.json(tasks);
});

router.get("/tasks", async (req, res): Promise<void> => {
  const parsed = ListTasksQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }
  const { status, search, limit = 50, offset = 0 } = parsed.data;

  let query = db.select().from(tasksTable).$dynamic();

  if (status) {
    query = query.where(eq(tasksTable.status, status));
  } else if (search) {
    query = query.where(
      or(
        ilike(tasksTable.title, `%${search}%`),
        ilike(tasksTable.instruction, `%${search}%`)
      )
    );
  }

  const tasks = await query
    .orderBy(desc(tasksTable.createdAt))
    .limit(limit ?? 50)
    .offset(offset ?? 0);

  res.json(tasks);
});

router.post("/tasks", async (req, res): Promise<void> => {
  const parsed = CreateTaskBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { instruction, title, targetUrl, outputFormat, maxRetries, timeoutSeconds } = parsed.data;

  const [task] = await db
    .insert(tasksTable)
    .values({
      instruction,
      title: title || instruction.slice(0, 60),
      targetUrl: targetUrl ?? null,
      outputFormat: outputFormat ?? "json",
      maxRetries: maxRetries ?? 3,
      timeoutSeconds: timeoutSeconds ?? 60,
      status: "pending",
    })
    .returning();

  res.status(201).json(task);
});

router.get("/tasks/:id", async (req, res): Promise<void> => {
  const params = GetTaskParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [task] = await db
    .select()
    .from(tasksTable)
    .where(eq(tasksTable.id, params.data.id));

  if (!task) {
    res.status(404).json({ error: "Task not found" });
    return;
  }

  const steps = await db
    .select()
    .from(taskStepsTable)
    .where(eq(taskStepsTable.taskId, task.id))
    .orderBy(taskStepsTable.stepNumber);

  res.json({ ...task, steps });
});

router.delete("/tasks/:id", async (req, res): Promise<void> => {
  const params = DeleteTaskParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [task] = await db
    .delete(tasksTable)
    .where(eq(tasksTable.id, params.data.id))
    .returning();

  if (!task) {
    res.status(404).json({ error: "Task not found" });
    return;
  }

  res.sendStatus(204);
});

router.post("/tasks/:id/execute", async (req, res): Promise<void> => {
  const params = ExecuteTaskParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [task] = await db
    .select()
    .from(tasksTable)
    .where(eq(tasksTable.id, params.data.id));

  if (!task) {
    res.status(404).json({ error: "Task not found" });
    return;
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    const [updated] = await db
      .update(tasksTable)
      .set({ status: "pending" })
      .where(eq(tasksTable.id, task.id))
      .returning();
    res.json(updated);
    return;
  }

  const [updated] = await db
    .update(tasksTable)
    .set({ status: "running", startedAt: new Date() })
    .where(eq(tasksTable.id, task.id))
    .returning();

  logger.info({ taskId: task.id }, "Task execution started");
  res.json(updated);
});

router.patch("/tasks/:id/pause", async (req, res): Promise<void> => {
  const params = PauseTaskParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [task] = await db
    .update(tasksTable)
    .set({ status: "paused" })
    .where(eq(tasksTable.id, params.data.id))
    .returning();

  if (!task) {
    res.status(404).json({ error: "Task not found" });
    return;
  }

  res.json(task);
});

router.patch("/tasks/:id/resume", async (req, res): Promise<void> => {
  const params = ResumeTaskParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [task] = await db
    .update(tasksTable)
    .set({ status: "running" })
    .where(eq(tasksTable.id, params.data.id))
    .returning();

  if (!task) {
    res.status(404).json({ error: "Task not found" });
    return;
  }

  res.json(task);
});

router.patch("/tasks/:id/stop", async (req, res): Promise<void> => {
  const params = StopTaskParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [task] = await db
    .update(tasksTable)
    .set({ status: "failed", errorMessage: "Stopped by user", completedAt: new Date() })
    .where(eq(tasksTable.id, params.data.id))
    .returning();

  if (!task) {
    res.status(404).json({ error: "Task not found" });
    return;
  }

  res.json(task);
});

export default router;
