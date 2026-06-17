import { Router, type IRouter } from "express";
import { eq, sql, count, avg } from "drizzle-orm";
import { db, tasksTable, settingsTable } from "@workspace/db";
import { UpdateSettingsBody } from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/stats/summary", async (_req, res): Promise<void> => {
  const [totals] = await db
    .select({
      total: count(),
      completed: sql<number>`count(*) filter (where status = 'completed')`,
      failed: sql<number>`count(*) filter (where status = 'failed')`,
      active: sql<number>`count(*) filter (where status = 'running' or status = 'paused')`,
      avgTime: avg(tasksTable.executionTime),
    })
    .from(tasksTable);

  const total = Number(totals.total ?? 0);
  const completed = Number(totals.completed ?? 0);
  const failed = Number(totals.failed ?? 0);
  const active = Number(totals.active ?? 0);
  const avgExec = totals.avgTime ? Number(totals.avgTime) : 0;
  const successRate = total > 0 ? completed / total : 0;

  res.json({
    totalTasks: total,
    completedTasks: completed,
    failedTasks: failed,
    successRate: Math.round(successRate * 1000) / 1000,
    avgExecutionTime: Math.round(avgExec * 10) / 10,
    activeTasksCount: active,
  });
});

router.get("/stats/settings", async (_req, res): Promise<void> => {
  let [settings] = await db.select().from(settingsTable).limit(1);

  if (!settings) {
    [settings] = await db
      .insert(settingsTable)
      .values({
        defaultTimeout: 60,
        autoRetry: true,
        screenshotFrequency: "every_step",
        defaultOutputFormat: "json",
      })
      .returning();
  }

  const masked = {
    ...settings,
    anthropicApiKey: settings.anthropicApiKey ? "sk-ant-***" : null,
  };

  res.json(masked);
});

router.patch("/stats/settings", async (req, res): Promise<void> => {
  const parsed = UpdateSettingsBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  let [existing] = await db.select().from(settingsTable).limit(1);

  if (!existing) {
    [existing] = await db
      .insert(settingsTable)
      .values({ defaultTimeout: 60, autoRetry: true, screenshotFrequency: "every_step", defaultOutputFormat: "json" })
      .returning();
  }

  const updates: Record<string, unknown> = {};
  if (parsed.data.anthropicApiKey !== undefined) updates.anthropicApiKey = parsed.data.anthropicApiKey;
  if (parsed.data.defaultTimeout !== undefined) updates.defaultTimeout = parsed.data.defaultTimeout;
  if (parsed.data.autoRetry !== undefined) updates.autoRetry = parsed.data.autoRetry;
  if (parsed.data.screenshotFrequency !== undefined) updates.screenshotFrequency = parsed.data.screenshotFrequency;
  if (parsed.data.defaultOutputFormat !== undefined) updates.defaultOutputFormat = parsed.data.defaultOutputFormat;

  const [updated] = await db
    .update(settingsTable)
    .set(updates)
    .where(eq(settingsTable.id, existing.id))
    .returning();

  const masked = {
    ...updated,
    anthropicApiKey: updated.anthropicApiKey ? "sk-ant-***" : null,
  };

  res.json(masked);
});

export default router;
