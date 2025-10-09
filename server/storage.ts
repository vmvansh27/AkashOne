import {
  type User,
  type InsertUser,
  type KubernetesCluster,
  type InsertKubernetesCluster,
  type Database,
  type InsertDatabase,
} from "@shared/schema";
import { randomUUID } from "crypto";

// modify the interface with any CRUD methods
// you might need

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: string, data: Partial<User>): Promise<User | undefined>;

  // Kubernetes
  getKubernetesClusters(userId: string): Promise<KubernetesCluster[]>;
  getKubernetesCluster(id: string): Promise<KubernetesCluster | undefined>;
  createKubernetesCluster(cluster: InsertKubernetesCluster & { userId: string }): Promise<KubernetesCluster>;
  updateKubernetesCluster(id: string, data: Partial<KubernetesCluster>): Promise<KubernetesCluster | undefined>;
  deleteKubernetesCluster(id: string): Promise<boolean>;

  // Databases
  getDatabases(userId: string): Promise<Database[]>;
  getDatabase(id: string): Promise<Database | undefined>;
  createDatabase(database: InsertDatabase & { userId: string }): Promise<Database>;
  updateDatabase(id: string, data: Partial<Database>): Promise<Database | undefined>;
  deleteDatabase(id: string): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private kubernetesClusters: Map<string, KubernetesCluster>;
  private databases: Map<string, Database>;

  constructor() {
    this.users = new Map();
    this.kubernetesClusters = new Map();
    this.databases = new Map();
  }

  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.email === email,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = {
      ...insertUser,
      id,
      twoFactorSecret: null,
      twoFactorEnabled: null,
      createdAt: new Date(),
      lastLogin: null,
    };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: string, data: Partial<User>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    const updatedUser = { ...user, ...data };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  // Kubernetes methods
  async getKubernetesClusters(userId: string): Promise<KubernetesCluster[]> {
    return Array.from(this.kubernetesClusters.values()).filter(
      (cluster) => cluster.userId === userId,
    );
  }

  async getKubernetesCluster(id: string): Promise<KubernetesCluster | undefined> {
    return this.kubernetesClusters.get(id);
  }

  async createKubernetesCluster(cluster: InsertKubernetesCluster & { userId: string }): Promise<KubernetesCluster> {
    const id = `k8s-${randomUUID().slice(0, 8)}`;
    const cpuTotal = cluster.masterNodes * 4 + cluster.workerNodes * 4;
    const memoryTotal = cluster.masterNodes * 16 + cluster.workerNodes * 16;

    const newCluster: KubernetesCluster = {
      id,
      name: cluster.name,
      version: cluster.version,
      status: cluster.status || "running",
      masterNodes: cluster.masterNodes,
      workerNodes: cluster.workerNodes,
      region: cluster.region,
      instanceType: cluster.instanceType,
      autoHealing: cluster.autoHealing ?? true,
      autoScaling: cluster.autoScaling ?? false,
      cpuUsed: 0,
      cpuTotal,
      memoryUsed: 0,
      memoryTotal,
      podsRunning: 0,
      podsTotal: 250,
      health: "healthy",
      createdAt: new Date(),
      userId: cluster.userId,
    };
    this.kubernetesClusters.set(id, newCluster);
    return newCluster;
  }

  async updateKubernetesCluster(id: string, data: Partial<KubernetesCluster>): Promise<KubernetesCluster | undefined> {
    const cluster = this.kubernetesClusters.get(id);
    if (!cluster) return undefined;
    const updatedCluster = { ...cluster, ...data };
    this.kubernetesClusters.set(id, updatedCluster);
    return updatedCluster;
  }

  async deleteKubernetesCluster(id: string): Promise<boolean> {
    return this.kubernetesClusters.delete(id);
  }

  // Database methods
  async getDatabases(userId: string): Promise<Database[]> {
    return Array.from(this.databases.values()).filter(
      (database) => database.userId === userId,
    );
  }

  async getDatabase(id: string): Promise<Database | undefined> {
    return this.databases.get(id);
  }

  async createDatabase(database: InsertDatabase & { userId: string }): Promise<Database> {
    const id = `db-${database.engine}-${randomUUID().slice(0, 8)}`;
    const portMap = {
      mysql: 3306,
      postgresql: 5432,
      mongodb: 27017,
      redis: 6379,
    };

    const connectionsMaxMap = {
      mysql: 200,
      postgresql: 500,
      mongodb: 100,
      redis: 1000,
    };

    const newDatabase: Database = {
      id,
      name: database.name,
      engine: database.engine,
      version: database.version,
      status: database.status || "running",
      storage: database.storage,
      cpu: database.cpu,
      memory: database.memory,
      region: database.region,
      instanceType: database.instanceType,
      endpoint: `${database.name}.akashone.com`,
      port: portMap[database.engine as keyof typeof portMap] || 5432,
      backupEnabled: database.backupEnabled ?? true,
      multiAZ: database.multiAZ ?? false,
      connectionsCurrent: 0,
      connectionsMax: connectionsMaxMap[database.engine as keyof typeof connectionsMaxMap] || 200,
      createdAt: new Date(),
      userId: database.userId,
    };
    this.databases.set(id, newDatabase);
    return newDatabase;
  }

  async updateDatabase(id: string, data: Partial<Database>): Promise<Database | undefined> {
    const database = this.databases.get(id);
    if (!database) return undefined;
    const updatedDatabase = { ...database, ...data };
    this.databases.set(id, updatedDatabase);
    return updatedDatabase;
  }

  async deleteDatabase(id: string): Promise<boolean> {
    return this.databases.delete(id);
  }
}

export const storage = new MemStorage();
