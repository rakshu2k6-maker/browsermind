import { pgTable, text, serial, timestamp, integer, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const settingsTable = pgTable("settings", {
  id: serial("id").primaryKey(),
  anthropicApiKey: text("anthropic_api_key"),
  defaultTimeout: integer("default_timeout").notNull().default(60),
  autoRetry: boolean("auto_retry").notNull().default(true),
  screenshotFrequency: text("screenshot_frequency").notNull().default("every_step"),
  defaultOutputFormat: text("default_output_format").notNull().default("json"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const insertSettingsSchema = createInsertSchema(settingsTable).omit({
  id: true,
  createdAt: true,
});
export type InsertSettings = z.infer<typeof insertSettingsSchema>;
export type Settings = typeof settingsTable.$inferSelect;
