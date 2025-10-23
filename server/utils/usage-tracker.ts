import type { IStorage } from "../storage";
import type { InsertUsageRecord, VirtualMachine, Volume, ObjectStorageBucket, ServicePlan } from "@shared/schema";

export interface ResourceUsage {
  resourceType: string;
  resourceId: string;
  resourceName: string;
  quantity: number;
  unit: string;
  unitPrice: number;
  totalCost: number;
}

export class UsageTracker {
  // Pricing constants in paise per unit
  private static readonly VM_RATE_PER_HOUR_IN_PAISE = 500; // 5 INR = 500 paise per hour
  private static readonly STORAGE_RATE_PER_GB_HOUR_IN_PAISE = 1; // Minimum 1 paise per GB-hour  
  private static readonly OBJECT_STORAGE_RATE_PER_GB_HOUR_IN_PAISE = 1; // Minimum 1 paise per GB-hour
  private static readonly BANDWIDTH_RATE_PER_GB_IN_PAISE = 1200; // 12 INR = 1200 paise per GB
  private static readonly K8S_RATE_PER_NODE_HOUR_IN_PAISE = 1000; // 10 INR = 1000 paise per node-hour
  private static readonly DATABASE_COMPUTE_RATE_PER_HOUR_IN_PAISE = 500; // 5 INR = 500 paise per hour
  private static readonly DATABASE_STORAGE_RATE_PER_GB_HOUR_IN_PAISE = 1; // Minimum 1 paise per GB-hour

  constructor(private storage: IStorage) {}

  async trackVMUsage(
    userId: string,
    vm: VirtualMachine,
    periodStart: Date,
    periodEnd: Date
  ): Promise<void> {
    const hours = this.calculateHours(periodStart, periodEnd);
    
    // Calculate cost using paise constants - preserve fractional paise
    const unitPriceInPaise = UsageTracker.VM_RATE_PER_HOUR_IN_PAISE;
    const totalCostInPaise = hours * unitPriceInPaise; // No rounding yet

    const usageRecord: InsertUsageRecord & { userId: string } = {
      userId,
      resourceType: "compute",
      resourceId: vm.id,
      resourceName: vm.name,
      metricType: "runtime",
      quantity: hours,
      unit: "hours",
      unitPrice: unitPriceInPaise,
      totalCost: totalCostInPaise, // Fractional paise preserved
      periodStart,
      periodEnd,
      metadata: {
        vmId: vm.id,
        serviceOfferingId: vm.serviceOfferingId,
        templateId: vm.templateId,
        state: vm.state,
      },
    };

    await this.storage.createUsageRecord(usageRecord);
  }

  async trackStorageUsage(
    userId: string,
    volume: Volume,
    periodStart: Date,
    periodEnd: Date
  ): Promise<void> {
    const hours = this.calculateHours(periodStart, periodEnd);
    const sizeGB = volume.size;
    const gbHours = sizeGB * hours;
    
    // Preserve fractional paise - accumulates correctly for sub-GB workloads
    const unitPriceInPaise = UsageTracker.STORAGE_RATE_PER_GB_HOUR_IN_PAISE;
    const totalCostInPaise = gbHours * unitPriceInPaise; // No rounding

    const usageRecord: InsertUsageRecord & { userId: string } = {
      userId,
      resourceType: "block_storage",
      resourceId: volume.id,
      resourceName: volume.name,
      metricType: "storage",
      quantity: gbHours,
      unit: "GB-hours",
      unitPrice: unitPriceInPaise,
      totalCost: totalCostInPaise, // Fractional paise preserved
      periodStart,
      periodEnd,
      metadata: {
        volumeId: volume.id,
        sizeGB: volume.size,
        storageType: volume.storageType,
        state: volume.state,
      },
    };

    await this.storage.createUsageRecord(usageRecord);
  }

  async trackObjectStorageUsage(
    userId: string,
    bucket: ObjectStorageBucket,
    periodStart: Date,
    periodEnd: Date
  ): Promise<void> {
    const hours = this.calculateHours(periodStart, periodEnd);
    const sizeGB = (bucket.size || 0) / (1024 * 1024 * 1024); // Convert bytes to GB
    const gbHours = sizeGB * hours;
    
    // Preserve fractional paise - critical for sub-GB buckets
    const unitPriceInPaise = UsageTracker.OBJECT_STORAGE_RATE_PER_GB_HOUR_IN_PAISE;
    const totalCostInPaise = gbHours * unitPriceInPaise; // No rounding

    const usageRecord: InsertUsageRecord & { userId: string } = {
      userId,
      resourceType: "object_storage",
      resourceId: bucket.id,
      resourceName: bucket.name,
      metricType: "storage",
      quantity: gbHours,
      unit: "GB-hours",
      unitPrice: unitPriceInPaise,
      totalCost: totalCostInPaise, // Fractional paise preserved
      periodStart,
      periodEnd,
      metadata: {
        bucketId: bucket.id,
        sizeGB,
        objectCount: bucket.objectCount,
        region: bucket.region,
      },
    };

    await this.storage.createUsageRecord(usageRecord);
  }

  async trackBandwidthUsage(
    userId: string,
    resourceId: string,
    resourceName: string,
    bandwidthGB: number,
    periodStart: Date,
    periodEnd: Date
  ): Promise<void> {
    // Preserve fractional paise
    const unitPriceInPaise = UsageTracker.BANDWIDTH_RATE_PER_GB_IN_PAISE;
    const totalCostInPaise = bandwidthGB * unitPriceInPaise; // No rounding

    const usageRecord: InsertUsageRecord & { userId: string } = {
      userId,
      resourceType: "bandwidth",
      resourceId,
      resourceName,
      metricType: "data_transfer",
      quantity: bandwidthGB,
      unit: "GB",
      unitPrice: unitPriceInPaise,
      totalCost: totalCostInPaise, // Fractional paise preserved
      periodStart,
      periodEnd,
      metadata: {
        bandwidthGB,
      },
    };

    await this.storage.createUsageRecord(usageRecord);
  }

  async trackKubernetesUsage(
    userId: string,
    clusterId: string,
    clusterName: string,
    nodeHours: number,
    periodStart: Date,
    periodEnd: Date
  ): Promise<void> {
    // Preserve fractional paise
    const unitPriceInPaise = UsageTracker.K8S_RATE_PER_NODE_HOUR_IN_PAISE;
    const totalCostInPaise = nodeHours * unitPriceInPaise; // No rounding

    const usageRecord: InsertUsageRecord & { userId: string } = {
      userId,
      resourceType: "kubernetes",
      resourceId: clusterId,
      resourceName: clusterName,
      metricType: "runtime",
      quantity: nodeHours,
      unit: "node-hours",
      unitPrice: unitPriceInPaise,
      totalCost: totalCostInPaise, // Fractional paise preserved
      periodStart,
      periodEnd,
      metadata: {
        clusterId,
      },
    };

    await this.storage.createUsageRecord(usageRecord);
  }

  async trackDatabaseUsage(
    userId: string,
    databaseId: string,
    databaseName: string,
    hours: number,
    storageGB: number,
    periodStart: Date,
    periodEnd: Date
  ): Promise<void> {
    // Preserve fractional paise
    const computeCostInPaise = hours * UsageTracker.DATABASE_COMPUTE_RATE_PER_HOUR_IN_PAISE;
    const storageCostInPaise = storageGB * hours * UsageTracker.DATABASE_STORAGE_RATE_PER_GB_HOUR_IN_PAISE;
    const totalCostInPaise = computeCostInPaise + storageCostInPaise; // No rounding

    const usageRecord: InsertUsageRecord & { userId: string } = {
      userId,
      resourceType: "database",
      resourceId: databaseId,
      resourceName: databaseName,
      metricType: "runtime",
      quantity: hours,
      unit: "hours",
      unitPrice: hours > 0 ? totalCostInPaise / hours : 0, // No rounding on unit price
      totalCost: totalCostInPaise, // Fractional paise preserved
      periodStart,
      periodEnd,
      metadata: {
        databaseId,
        storageGB,
        computeHours: hours,
      },
    };

    await this.storage.createUsageRecord(usageRecord);
  }

  async trackAllActiveResources(userId: string): Promise<void> {
    const now = new Date();
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000);

    // Track active VMs
    const vms = await this.storage.getVirtualMachines(userId);
    const activeVMs = vms.filter(vm => vm.state === "Running");
    
    for (const vm of activeVMs) {
      await this.trackVMUsage(userId, vm, oneHourAgo, now);
    }

    // Track active storage volumes (bill all allocated volumes)
    const volumes = await this.storage.getVolumes(userId);
    
    for (const volume of volumes) {
      await this.trackStorageUsage(userId, volume, oneHourAgo, now);
    }

    // Track object storage buckets
    const buckets = await this.storage.getObjectStorageBuckets(userId);
    
    for (const bucket of buckets) {
      await this.trackObjectStorageUsage(userId, bucket, oneHourAgo, now);
    }

    // Track Kubernetes clusters
    const clusters = await this.storage.getKubernetesClusters(userId);
    const activeClusters = clusters.filter(c => c.status === "Active");
    
    for (const cluster of activeClusters) {
      const nodeCount = cluster.masterNodes + cluster.workerNodes;
      await this.trackKubernetesUsage(
        userId,
        cluster.id,
        cluster.name,
        nodeCount,
        oneHourAgo,
        now
      );
    }

    // Track databases
    const databases = await this.storage.getDatabases(userId);
    const activeDatabases = databases.filter(db => db.status === "active");
    
    for (const database of activeDatabases) {
      const storageGB = database.storage || 10;
      await this.trackDatabaseUsage(
        userId,
        database.id,
        database.name,
        1,
        storageGB,
        oneHourAgo,
        now
      );
    }
  }

  async generateUsageSummary(
    userId: string,
    startDate: Date,
    endDate: Date
  ): Promise<{
    totalCostInPaise: number;
    breakdown: Record<string, { quantity: number; costInPaise: number; unit: string }>;
  }> {
    const records = await this.storage.getUsageRecords(userId, {
      startDate,
      endDate,
    });

    const breakdown: Record<string, { quantity: number; costInPaise: number; unit: string }> = {};
    let totalCostInPaise = 0;

    for (const record of records) {
      if (!breakdown[record.resourceType]) {
        breakdown[record.resourceType] = {
          quantity: 0,
          costInPaise: 0,
          unit: record.unit,
        };
      }

      breakdown[record.resourceType].quantity += record.quantity;
      breakdown[record.resourceType].costInPaise += record.totalCost; // Already in paise
      totalCostInPaise += record.totalCost; // Already in paise
    }

    return { totalCostInPaise, breakdown };
  }

  private calculateHours(start: Date, end: Date): number {
    const diff = end.getTime() - start.getTime();
    return diff / (1000 * 60 * 60); // Convert milliseconds to hours
  }
}
