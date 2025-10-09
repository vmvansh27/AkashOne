import crypto from "crypto";
import axios, { AxiosInstance } from "axios";

export interface CloudStackConfig {
  apiUrl: string;
  apiKey: string;
  secretKey: string;
}

export class CloudStackClient {
  private apiUrl: string;
  private apiKey: string;
  private secretKey: string;
  private httpClient: AxiosInstance;

  constructor(config: CloudStackConfig) {
    this.apiUrl = config.apiUrl;
    this.apiKey = config.apiKey;
    this.secretKey = config.secretKey;

    this.httpClient = axios.create({
      baseURL: this.apiUrl,
      timeout: 30000,
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
    });
  }

  /**
   * Generate CloudStack API signature
   * CloudStack uses HMAC SHA1 signature for authentication
   */
  private generateSignature(params: Record<string, any>): string {
    // Sort parameters alphabetically
    const sortedParams = Object.keys(params)
      .sort()
      .map((key) => `${encodeURIComponent(key).toLowerCase()}=${encodeURIComponent(params[key]).toLowerCase()}`)
      .join("&");

    // Create HMAC SHA1 signature
    const hmac = crypto.createHmac("sha1", this.secretKey);
    hmac.update(sortedParams);
    const signature = hmac.digest("base64");

    return signature;
  }

  /**
   * Make a CloudStack API request
   */
  async request(command: string, params: Record<string, any> = {}): Promise<any> {
    const requestParams: Record<string, any> = {
      command,
      apiKey: this.apiKey,
      response: "json",
      ...params,
    };

    // Generate signature
    const signature = this.generateSignature(requestParams);
    requestParams.signature = signature;

    try {
      const response = await this.httpClient.get("", {
        params: requestParams,
      });

      // CloudStack wraps response in command-specific key
      const commandKey = `${command.toLowerCase()}response`;
      return response.data[commandKey] || response.data;
    } catch (error: any) {
      if (error.response?.data) {
        const errorResponse = error.response.data;
        const commandKey = `${command.toLowerCase()}response`;
        const errorData = errorResponse[commandKey] || errorResponse;
        
        throw new Error(
          errorData.errortext || 
          errorData.message || 
          `CloudStack API error: ${error.message}`
        );
      }
      throw new Error(`CloudStack API request failed: ${error.message}`);
    }
  }

  // ============================================
  // COMPUTE - Virtual Machines
  // ============================================

  /**
   * List all zones
   */
  async listZones(available: boolean = true): Promise<any> {
    return this.request("listZones", { available });
  }

  /**
   * List service offerings (compute plans)
   */
  async listServiceOfferings(): Promise<any> {
    return this.request("listServiceOfferings");
  }

  /**
   * List templates (OS images)
   */
  async listTemplates(templateFilter: string = "featured", zoneId?: string): Promise<any> {
    const params: any = { templatefilter: templateFilter };
    if (zoneId) params.zoneid = zoneId;
    return this.request("listTemplates", params);
  }

  /**
   * Deploy a new virtual machine
   */
  async deployVirtualMachine(params: {
    serviceOfferingId: string;
    templateId: string;
    zoneId: string;
    name?: string;
    displayName?: string;
    networkIds?: string[];
    keyPair?: string;
    userData?: string;
  }): Promise<any> {
    const requestParams: any = {
      serviceofferingid: params.serviceOfferingId,
      templateid: params.templateId,
      zoneid: params.zoneId,
    };

    if (params.name) requestParams.name = params.name;
    if (params.displayName) requestParams.displayname = params.displayName;
    if (params.networkIds?.length) requestParams.networkids = params.networkIds.join(",");
    if (params.keyPair) requestParams.keypair = params.keyPair;
    if (params.userData) requestParams.userdata = Buffer.from(params.userData).toString("base64");

    return this.request("deployVirtualMachine", requestParams);
  }

  /**
   * List virtual machines
   */
  async listVirtualMachines(params?: {
    id?: string;
    name?: string;
    state?: string;
    zoneId?: string;
  }): Promise<any> {
    const requestParams: any = {};
    if (params?.id) requestParams.id = params.id;
    if (params?.name) requestParams.name = params.name;
    if (params?.state) requestParams.state = params.state;
    if (params?.zoneId) requestParams.zoneid = params.zoneId;

    return this.request("listVirtualMachines", requestParams);
  }

  /**
   * Start a virtual machine
   */
  async startVirtualMachine(id: string): Promise<any> {
    return this.request("startVirtualMachine", { id });
  }

  /**
   * Stop a virtual machine
   */
  async stopVirtualMachine(id: string, forced: boolean = false): Promise<any> {
    return this.request("stopVirtualMachine", { id, forced });
  }

  /**
   * Reboot a virtual machine
   */
  async rebootVirtualMachine(id: string): Promise<any> {
    return this.request("rebootVirtualMachine", { id });
  }

  /**
   * Destroy a virtual machine
   */
  async destroyVirtualMachine(id: string, expunge: boolean = false): Promise<any> {
    return this.request("destroyVirtualMachine", { id, expunge });
  }

  /**
   * Scale virtual machine (change service offering)
   */
  async scaleVirtualMachine(id: string, serviceOfferingId: string): Promise<any> {
    return this.request("scaleVirtualMachine", {
      id,
      serviceofferingid: serviceOfferingId,
    });
  }

  // ============================================
  // NETWORK - IPs, Firewall, Load Balancing
  // ============================================

  /**
   * List public IP addresses
   */
  async listPublicIpAddresses(params?: { 
    zoneId?: string; 
    account?: string;
  }): Promise<any> {
    const requestParams: any = {};
    if (params?.zoneId) requestParams.zoneid = params.zoneId;
    if (params?.account) requestParams.account = params.account;
    return this.request("listPublicIpAddresses", requestParams);
  }

  /**
   * Associate a public IP address
   */
  async associateIpAddress(zoneId: string, networkId?: string): Promise<any> {
    const params: any = { zoneid: zoneId };
    if (networkId) params.networkid = networkId;
    return this.request("associateIpAddress", params);
  }

  /**
   * Create firewall rule
   */
  async createFirewallRule(params: {
    ipAddressId: string;
    protocol: string;
    startPort?: number;
    endPort?: number;
    cidrList?: string[];
  }): Promise<any> {
    const requestParams: any = {
      ipaddressid: params.ipAddressId,
      protocol: params.protocol,
    };
    if (params.startPort) requestParams.startport = params.startPort;
    if (params.endPort) requestParams.endport = params.endPort;
    if (params.cidrList) requestParams.cidrlist = params.cidrList.join(",");

    return this.request("createFirewallRule", requestParams);
  }

  /**
   * Create port forwarding rule
   */
  async createPortForwardingRule(params: {
    ipAddressId: string;
    protocol: string;
    publicPort: number;
    privatePort: number;
    virtualMachineId: string;
  }): Promise<any> {
    return this.request("createPortForwardingRule", {
      ipaddressid: params.ipAddressId,
      protocol: params.protocol,
      publicport: params.publicPort,
      privateport: params.privatePort,
      virtualmachineid: params.virtualMachineId,
    });
  }

  // ============================================
  // STORAGE - Volumes, Snapshots
  // ============================================

  /**
   * List volumes
   */
  async listVolumes(params?: { 
    id?: string; 
    virtualMachineId?: string;
    zoneId?: string;
  }): Promise<any> {
    const requestParams: any = {};
    if (params?.id) requestParams.id = params.id;
    if (params?.virtualMachineId) requestParams.virtualmachineid = params.virtualMachineId;
    if (params?.zoneId) requestParams.zoneid = params.zoneId;
    return this.request("listVolumes", requestParams);
  }

  /**
   * Create volume
   */
  async createVolume(params: {
    name: string;
    diskOfferingId: string;
    zoneId: string;
    size?: number;
  }): Promise<any> {
    const requestParams: any = {
      name: params.name,
      diskofferingid: params.diskOfferingId,
      zoneid: params.zoneId,
    };
    if (params.size) requestParams.size = params.size;
    return this.request("createVolume", requestParams);
  }

  /**
   * Attach volume to VM
   */
  async attachVolume(id: string, virtualMachineId: string): Promise<any> {
    return this.request("attachVolume", {
      id,
      virtualmachineid: virtualMachineId,
    });
  }

  /**
   * Detach volume from VM
   */
  async detachVolume(id: string): Promise<any> {
    return this.request("detachVolume", { id });
  }

  /**
   * Create snapshot
   */
  async createSnapshot(volumeId: string, name?: string): Promise<any> {
    const params: any = { volumeid: volumeId };
    if (name) params.name = name;
    return this.request("createSnapshot", params);
  }

  /**
   * List snapshots
   */
  async listSnapshots(params?: { 
    volumeId?: string; 
    id?: string;
  }): Promise<any> {
    const requestParams: any = {};
    if (params?.volumeId) requestParams.volumeid = params.volumeId;
    if (params?.id) requestParams.id = params.id;
    return this.request("listSnapshots", requestParams);
  }

  // ============================================
  // USAGE & BILLING
  // ============================================

  /**
   * List usage records
   */
  async listUsageRecords(params: {
    startDate: Date;
    endDate: Date;
    account?: string;
    domainId?: string;
  }): Promise<any> {
    return this.request("listUsageRecords", {
      startdate: params.startDate.toISOString(),
      enddate: params.endDate.toISOString(),
      account: params.account,
      domainid: params.domainId,
    });
  }

  /**
   * List events
   */
  async listEvents(params?: {
    startDate?: Date;
    endDate?: Date;
    level?: string;
    type?: string;
  }): Promise<any> {
    const requestParams: any = {};
    if (params?.startDate) requestParams.startdate = params.startDate.toISOString();
    if (params?.endDate) requestParams.enddate = params.endDate.toISOString();
    if (params?.level) requestParams.level = params.level;
    if (params?.type) requestParams.type = params.type;
    return this.request("listEvents", requestParams);
  }
}

// Singleton instance
let cloudStackClient: CloudStackClient | null = null;

/**
 * Get or initialize CloudStack client
 */
export function getCloudStackClient(): CloudStackClient {
  if (!cloudStackClient) {
    const apiUrl = process.env.CLOUDSTACK_API_URL;
    const apiKey = process.env.CLOUDSTACK_API_KEY;
    const secretKey = process.env.CLOUDSTACK_SECRET_KEY;

    if (!apiUrl || !apiKey || !secretKey) {
      throw new Error(
        "CloudStack credentials not configured. Please set CLOUDSTACK_API_URL, CLOUDSTACK_API_KEY, and CLOUDSTACK_SECRET_KEY environment variables."
      );
    }

    cloudStackClient = new CloudStackClient({
      apiUrl,
      apiKey,
      secretKey,
    });
  }

  return cloudStackClient;
}
