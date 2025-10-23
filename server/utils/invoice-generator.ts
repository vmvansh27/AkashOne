import type { IStorage } from "../storage";
import type { BillingAddress, Invoice, InvoiceLineItem, TaxCalculation } from "@shared/schema";
import { TaxCalculator } from "./tax-calculator";

export interface InvoiceGenerationOptions {
  userId: string;
  periodStart: Date;
  periodEnd: Date;
  dueDate?: Date;
}

export interface InvoiceGenerationResult {
  invoice: Invoice;
  lineItems: InvoiceLineItem[];
  taxCalculations: TaxCalculation[];
  success: boolean;
  error?: string;
}

export class InvoiceGenerator {
  // Default seller address details for Mieux Technologies Pvt Ltd
  private static DEFAULT_SELLER_STATE = "Maharashtra";
  private static DEFAULT_SELLER_STATE_CODE = "27";
  private static DEFAULT_HSN_CODE = "998314"; // Fallback: Cloud computing services

  constructor(private storage: IStorage) {}

  // Fetch HSN/SAC code from database based on service type
  private async getHsnCodeForServiceType(serviceType: string): Promise<{ hsnCode: string; sacCode: string }> {
    try {
      const hsnCodes = await this.storage.getHsnCodes();
      const hsnEntry = hsnCodes.find(code => 
        code.serviceType.toLowerCase() === serviceType.toLowerCase() && code.isActive
      );

      if (hsnEntry) {
        return {
          hsnCode: hsnEntry.hsnCode,
          sacCode: hsnEntry.sacCode,
        };
      }
    } catch (error) {
      console.error(`Error fetching HSN code for ${serviceType}:`, error);
    }

    // Fallback to default cloud computing code
    return {
      hsnCode: InvoiceGenerator.DEFAULT_HSN_CODE,
      sacCode: InvoiceGenerator.DEFAULT_HSN_CODE,
    };
  }

  // Helper to convert rupees to paise
  private toPaise(rupees: number): number {
    return Math.round(rupees * 100);
  }

  // Helper to convert paise to rupees
  private toRupees(paise: number): number {
    return paise / 100;
  }

  async generateInvoice(options: InvoiceGenerationOptions): Promise<InvoiceGenerationResult> {
    const { userId, periodStart, periodEnd, dueDate } = options;

    try {
      // 1. Get unbilled usage records for the period
      const usageRecords = await this.storage.getUsageRecords(userId, {
        startDate: periodStart,
        endDate: periodEnd,
        billed: false,
      });

      if (usageRecords.length === 0) {
        return {
          invoice: {} as Invoice,
          lineItems: [],
          taxCalculations: [],
          success: false,
          error: "No unbilled usage records found for the period",
        };
      }

      // 2. Get buyer's billing address (default address)
      let buyerAddress = await this.storage.getDefaultBillingAddress(userId);
      
      if (!buyerAddress) {
        // Create a default address if none exists
        const user = await this.storage.getUser(userId);
        if (!user) {
          return {
            invoice: {} as Invoice,
            lineItems: [],
            taxCalculations: [],
            success: false,
            error: "User not found",
          };
        }

        buyerAddress = await this.storage.createBillingAddress({
          userId,
          addressLine1: "Address not provided",
          city: "Mumbai",
          state: "Maharashtra",
          stateCode: "27",
          postalCode: "400001",
          country: "India",
          isDefault: true,
          gstNumber: user.gstNumber || null,
          addressLine2: null,
        });
      }

      // 3. Determine tax type and calculate taxes
      const isSameState = buyerAddress.state.toLowerCase().trim() === 
                          InvoiceGenerator.DEFAULT_SELLER_STATE.toLowerCase().trim();
      
      const taxType = isSameState ? "intra_state" : "inter_state";

      // 4. Group usage records by resource type and calculate line items
      const lineItemsData = this.groupUsageRecordsByType(usageRecords);

      // 5. Calculate subtotal (round fractional paise to integer paise)
      const subtotalInPaise = Math.round(lineItemsData.reduce((sum, item) => sum + item.amountInPaise, 0));

      // 6. Calculate GST (18%)
      const gstRate = 18;
      let cgstAmount = 0;
      let sgstAmount = 0;
      let igstAmount = 0;

      if (isSameState) {
        // CGST (9%) + SGST (9%)
        cgstAmount = Math.round((subtotalInPaise * 9) / 100);
        sgstAmount = Math.round((subtotalInPaise * 9) / 100);
      } else {
        // IGST (18%)
        igstAmount = Math.round((subtotalInPaise * 18) / 100);
      }

      const totalInPaise = subtotalInPaise + cgstAmount + sgstAmount + igstAmount;

      // 7. Fetch HSN/SAC code for primary service type (use first line item's type)
      const primaryServiceType = lineItemsData[0]?.resourceType || "compute";
      const hsnSacCodes = await this.getHsnCodeForServiceType(primaryServiceType);

      // 8. Generate invoice number
      const invoiceNumber = await this.storage.getNextInvoiceNumber();

      // 9. Create invoice
      const invoice = await this.storage.createInvoice({
        userId,
        invoiceNumber,
        status: "draft",
        billingAddressId: buyerAddress.id,
        billingPeriodStart: periodStart,
        billingPeriodEnd: periodEnd,
        subtotalAmount: subtotalInPaise,
        cgstAmount,
        sgstAmount,
        igstAmount,
        discountAmount: 0,
        totalAmount: totalInPaise,
        taxType,
        gstRate,
        hsnCode: hsnSacCodes.hsnCode,
        sacCode: hsnSacCodes.sacCode,
        placeOfSupply: buyerAddress.state,
        einvoiceIrn: null,
        einvoiceAckNo: null,
        einvoiceAckDate: null,
        einvoiceQrCode: null,
        einvoiceEnabled: false,
        dueDate: dueDate || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        paidAt: null,
        currency: "INR",
      });

      // 9. Create invoice line items
      const lineItems: InvoiceLineItem[] = [];
      for (const itemData of lineItemsData) {
        const lineItem = await this.storage.createInvoiceLineItem({
          invoiceId: invoice.id,
          resourceType: itemData.resourceType,
          resourceId: itemData.resourceIds[0] || null,
          resourceName: itemData.description,
          description: itemData.description,
          quantity: Math.round(itemData.quantity * 100) / 100, // Round to 2 decimals
          unit: itemData.unit,
          unitPrice: Math.round(itemData.unitPriceInPaise), // Round to integer paise
          amount: Math.round(itemData.amountInPaise), // Round to integer paise
          usageStart: periodStart,
          usageEnd: periodEnd,
        });

        lineItems.push(lineItem);
      }

      // 10. Create tax calculation record
      const taxCalc = await this.storage.createTaxCalculation({
        invoiceId: invoice.id,
        userId,
        taxType,
        supplierState: InvoiceGenerator.DEFAULT_SELLER_STATE,
        supplierStateCode: InvoiceGenerator.DEFAULT_SELLER_STATE_CODE,
        customerState: buyerAddress.state,
        customerStateCode: buyerAddress.stateCode,
        taxableAmount: subtotalInPaise,
        cgstRate: isSameState ? 9 : 0,
        sgstRate: isSameState ? 9 : 0,
        igstRate: isSameState ? 0 : 18,
        cgstAmount,
        sgstAmount,
        igstAmount,
        totalTaxAmount: cgstAmount + sgstAmount + igstAmount,
        gstRate,
        hsnSacCode: hsnSacCodes.sacCode, // Use database HSN/SAC code
      });

      // 11. Mark usage records as billed
      const usageRecordIds = usageRecords.map(r => r.id);
      await this.storage.markUsageRecordsAsBilled(usageRecordIds, invoice.id);

      return {
        invoice,
        lineItems,
        taxCalculations: [taxCalc],
        success: true,
      };
    } catch (error) {
      return {
        invoice: {} as Invoice,
        lineItems: [],
        taxCalculations: [],
        success: false,
        error: error instanceof Error ? error.message : "Unknown error occurred",
      };
    }
  }

  private groupUsageRecordsByType(usageRecords: any[]) {
    const grouped = new Map<string, {
      resourceType: string;
      description: string;
      quantity: number;
      unit: string;
      unitPriceInPaise: number;
      amountInPaise: number;
      resourceIds: string[];
    }>();

    for (const record of usageRecords) {
      const key = record.resourceType;
      
      if (!grouped.has(key)) {
        grouped.set(key, {
          resourceType: record.resourceType,
          description: this.getDescriptionForResourceType(record.resourceType),
          quantity: 0,
          unit: record.unit,
          unitPriceInPaise: record.unitPrice, // Already in paise from usage tracker
          amountInPaise: 0,
          resourceIds: [],
        });
      }

      const item = grouped.get(key)!;
      item.quantity += record.quantity;
      item.amountInPaise += record.totalCost; // Already in paise from usage tracker
      item.resourceIds.push(record.resourceId);
      
      // Update average unit price (all values already in paise)
      if (item.quantity > 0) {
        item.unitPriceInPaise = Math.round(item.amountInPaise / item.quantity);
      }
    }

    return Array.from(grouped.values());
  }

  private getDescriptionForResourceType(resourceType: string): string {
    const descriptions: Record<string, string> = {
      compute: "Virtual Machine Usage",
      block_storage: "Block Storage Usage",
      object_storage: "Object Storage Usage",
      bandwidth: "Data Transfer",
      kubernetes: "Kubernetes Cluster Usage",
      database: "Managed Database Usage",
      cdn: "CDN Usage",
      dns: "DNS Services",
      monitoring: "Monitoring Services",
      backup: "Backup Services",
    };

    return descriptions[resourceType] || `${resourceType} Usage`;
  }

  async finalizeInvoice(invoiceId: string): Promise<Invoice | null> {
    const invoice = await this.storage.getInvoice(invoiceId);
    if (!invoice) return null;

    return await this.storage.updateInvoice(invoiceId, {
      status: "issued",
      updatedAt: new Date(),
    }) || null;
  }

  async markInvoiceAsPaid(
    invoiceId: string
  ): Promise<Invoice | null> {
    const invoice = await this.storage.getInvoice(invoiceId);
    if (!invoice) return null;

    return await this.storage.updateInvoice(invoiceId, {
      status: "paid",
      paidAt: new Date(),
      updatedAt: new Date(),
    }) || null;
  }

  async markInvoiceAsOverdue(invoiceId: string): Promise<Invoice | null> {
    const invoice = await this.storage.getInvoice(invoiceId);
    if (!invoice || invoice.status === "paid") return null;

    const now = new Date();
    if (invoice.dueDate < now) {
      return await this.storage.updateInvoice(invoiceId, {
        status: "overdue",
        updatedAt: new Date(),
      }) || null;
    }

    return invoice;
  }
}
