import { sql } from "drizzle-orm";
import { pgTable, text, varchar, boolean, timestamp, integer, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  twoFactorSecret: text("two_factor_secret"),
  twoFactorEnabled: boolean("two_factor_enabled").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  lastLogin: timestamp("last_login"),
});

export const kubernetesClusters = pgTable("kubernetes_clusters", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  version: text("version").notNull(),
  status: text("status").notNull().default("creating"),
  masterNodes: integer("master_nodes").notNull(),
  workerNodes: integer("worker_nodes").notNull(),
  region: text("region").notNull(),
  instanceType: text("instance_type").notNull(),
  autoHealing: boolean("auto_healing").notNull().default(true),
  autoScaling: boolean("auto_scaling").notNull().default(false),
  cpuUsed: integer("cpu_used").notNull().default(0),
  cpuTotal: integer("cpu_total").notNull(),
  memoryUsed: integer("memory_used").notNull().default(0),
  memoryTotal: integer("memory_total").notNull(),
  podsRunning: integer("pods_running").notNull().default(0),
  podsTotal: integer("pods_total").notNull().default(250),
  health: text("health").notNull().default("healthy"),
  createdAt: timestamp("created_at").defaultNow(),
  userId: varchar("user_id").references(() => users.id),
});

export const databases = pgTable("databases", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  engine: text("engine").notNull(),
  version: text("version").notNull(),
  status: text("status").notNull().default("creating"),
  storage: integer("storage").notNull(),
  cpu: integer("cpu").notNull(),
  memory: integer("memory").notNull(),
  region: text("region").notNull(),
  instanceType: text("instance_type").notNull(),
  endpoint: text("endpoint").notNull(),
  port: integer("port").notNull(),
  backupEnabled: boolean("backup_enabled").notNull().default(true),
  multiAZ: boolean("multi_az").notNull().default(false),
  connectionsCurrent: integer("connections_current").notNull().default(0),
  connectionsMax: integer("connections_max").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  userId: varchar("user_id").references(() => users.id),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  email: true,
  password: true,
});

export const insertKubernetesClusterSchema = createInsertSchema(kubernetesClusters).omit({
  id: true,
  createdAt: true,
  cpuUsed: true,
  memoryUsed: true,
  podsRunning: true,
  podsTotal: true,
  health: true,
  userId: true,
});

export const insertDatabaseSchema = createInsertSchema(databases).omit({
  id: true,
  createdAt: true,
  endpoint: true,
  connectionsCurrent: true,
  userId: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type KubernetesCluster = typeof kubernetesClusters.$inferSelect;
export type InsertKubernetesCluster = z.infer<typeof insertKubernetesClusterSchema>;
export type Database = typeof databases.$inferSelect;
export type InsertDatabase = z.infer<typeof insertDatabaseSchema>;
