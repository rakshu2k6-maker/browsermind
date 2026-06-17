import { Router, type IRouter } from "express";
import { eq, desc, sql } from "drizzle-orm";
import { db, templatesTable, tasksTable } from "@workspace/db";
import {
  GetTemplateParams,
  DeleteTemplateParams,
  ExecuteTemplateParams,
  CreateTemplateBody,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/templates", async (_req, res): Promise<void> => {
  const templates = await db
    .select()
    .from(templatesTable)
    .orderBy(desc(templatesTable.createdAt));
  res.json(templates);
});

router.post("/templates", async (req, res): Promise<void> => {
  const parsed = CreateTemplateBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [template] = await db
    .insert(templatesTable)
    .values({
      name: parsed.data.name,
      description: parsed.data.description ?? null,
      instruction: parsed.data.instruction,
      targetUrl: parsed.data.targetUrl ?? null,
      outputFormat: parsed.data.outputFormat ?? "json",
    })
    .returning();

  res.status(201).json(template);
});

router.get("/templates/:id", async (req, res): Promise<void> => {
  const params = GetTemplateParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [template] = await db
    .select()
    .from(templatesTable)
    .where(eq(templatesTable.id, params.data.id));

  if (!template) {
    res.status(404).json({ error: "Template not found" });
    return;
  }

  res.json(template);
});

router.delete("/templates/:id", async (req, res): Promise<void> => {
  const params = DeleteTemplateParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [template] = await db
    .delete(templatesTable)
    .where(eq(templatesTable.id, params.data.id))
    .returning();

  if (!template) {
    res.status(404).json({ error: "Template not found" });
    return;
  }

  res.sendStatus(204);
});

router.post("/templates/:id/execute", async (req, res): Promise<void> => {
  const params = ExecuteTemplateParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [template] = await db
    .select()
    .from(templatesTable)
    .where(eq(templatesTable.id, params.data.id));

  if (!template) {
    res.status(404).json({ error: "Template not found" });
    return;
  }

  await db
    .update(templatesTable)
    .set({ timesUsed: sql`${templatesTable.timesUsed} + 1` })
    .where(eq(templatesTable.id, template.id));

  const [task] = await db
    .insert(tasksTable)
    .values({
      instruction: template.instruction,
      title: template.name,
      targetUrl: template.targetUrl ?? null,
      outputFormat: template.outputFormat,
      status: "pending",
    })
    .returning();

  res.status(201).json(task);
});

export default router;
