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

export const dnsDomains = pgTable("dns_domains", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  status: text("status").notNull().default("pending"),
  recordCount: integer("record_count").notNull().default(0),
  dnssec: boolean("dnssec").notNull().default(false),
  nameservers: text("nameservers").array().notNull().default(sql`ARRAY['ns1.akashone.com', 'ns2.akashone.com']::text[]`),
  lastModified: timestamp("last_modified").defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
  userId: varchar("user_id").references(() => users.id),
});

export const dnsRecords = pgTable("dns_records", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  domainId: varchar("domain_id").notNull().references(() => dnsDomains.id, { onDelete: 'cascade' }),
  type: text("type").notNull(),
  name: text("name").notNull(),
  value: text("value").notNull(),
  ttl: integer("ttl").notNull().default(3600),
  priority: integer("priority"),
  createdAt: timestamp("created_at").defaultNow(),
  userId: varchar("user_id").references(() => users.id),
});

export const virtualMachines = pgTable("virtual_machines", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  cloudstackId: varchar("cloudstack_id").notNull().unique(),
  name: text("name").notNull(),
  displayName: text("display_name"),
  state: text("state").notNull().default("Creating"),
  templateId: varchar("template_id").notNull(),
  templateName: text("template_name"),
  serviceOfferingId: varchar("service_offering_id").notNull(),
  serviceOfferingName: text("service_offering_name"),
  zoneId: varchar("zone_id").notNull(),
  zoneName: text("zone_name"),
  cpu: integer("cpu").notNull(),
  memory: integer("memory").notNull(),
  diskSize: integer("disk_size"),
  ipAddress: text("ip_address"),
  publicIp: text("public_ip"),
  networkIds: text("network_ids").array(),
  tags: jsonb("tags"),
  createdAt: timestamp("created_at").defaultNow(),
  lastSynced: timestamp("last_synced").defaultNow(),
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

export const insertDnsDomainSchema = createInsertSchema(dnsDomains).omit({
  id: true,
  createdAt: true,
  lastModified: true,
  recordCount: true,
  userId: true,
});

export const insertDnsRecordSchema = createInsertSchema(dnsRecords).omit({
  id: true,
  createdAt: true,
  userId: true,
});

export const insertVirtualMachineSchema = createInsertSchema(virtualMachines).omit({
  id: true,
  createdAt: true,
  lastSynced: true,
  userId: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;
export type KubernetesCluster = typeof kubernetesClusters.$inferSelect;
export type InsertKubernetesCluster = z.infer<typeof insertKubernetesClusterSchema>;
export type Database = typeof databases.$inferSelect;
export type InsertDatabase = z.infer<typeof insertDatabaseSchema>;
export type DnsDomain = typeof dnsDomains.$inferSelect;
export type InsertDnsDomain = z.infer<typeof insertDnsDomainSchema>;
export type DnsRecord = typeof dnsRecords.$inferSelect;
export type InsertDnsRecord = z.infer<typeof insertDnsRecordSchema>;
export type VirtualMachine = typeof virtualMachines.$inferSelect;
export type InsertVirtualMachine = z.infer<typeof insertVirtualMachineSchema>;

export const vmSnapshots = pgTable("vm_snapshots", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  cloudstackSnapshotId: varchar("cloudstack_snapshot_id", { length: 255 }).notNull().unique(),
  vmId: varchar("vm_id").references(() => virtualMachines.id, { onDelete: "cascade" }).notNull(),
  userId: varchar("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  state: varchar("state", { length: 50 }).notNull(),
  snapshotMemory: boolean("snapshot_memory").default(true),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertVMSnapshotSchema = createInsertSchema(vmSnapshots).omit({
  id: true,
  createdAt: true,
});

export type VMSnapshot = typeof vmSnapshots.$inferSelect;
export type InsertVMSnapshot = z.infer<typeof insertVMSnapshotSchema>;
