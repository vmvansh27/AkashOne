import type { BillingAddress } from "@shared/schema";

export interface TaxCalculationResult {
  taxableAmountInPaise: number;
  cgstRate: number;
  sgstRate: number;
  igstRate: number;
  cgstAmountInPaise: number;
  sgstAmountInPaise: number;
  igstAmountInPaise: number;
  totalTaxInPaise: number;
  totalAmountInPaise: number;
  taxType: "CGST+SGST" | "IGST";
  sellerState: string;
  buyerState: string;
  hsnSacCode: string;
}

export interface TaxCalculationInput {
  amountInPaise: number; // Amount in paise (integer)
  sellerAddress: BillingAddress;
  buyerAddress: BillingAddress;
  hsnSacCode: string;
  taxRate?: number; // Optional override, defaults to 18%
}

export const INDIAN_STATES = [
  "Andhra Pradesh",
  "Arunachal Pradesh",
  "Assam",
  "Bihar",
  "Chhattisgarh",
  "Goa",
  "Gujarat",
  "Haryana",
  "Himachal Pradesh",
  "Jharkhand",
  "Karnataka",
  "Kerala",
  "Madhya Pradesh",
  "Maharashtra",
  "Manipur",
  "Meghalaya",
  "Mizoram",
  "Nagaland",
  "Odisha",
  "Punjab",
  "Rajasthan",
  "Sikkim",
  "Tamil Nadu",
  "Telangana",
  "Tripura",
  "Uttar Pradesh",
  "Uttarakhand",
  "West Bengal",
  "Andaman and Nicobar Islands",
  "Chandigarh",
  "Dadra and Nagar Haveli and Daman and Diu",
  "Delhi",
  "Jammu and Kashmir",
  "Ladakh",
  "Lakshadweep",
  "Puducherry",
] as const;

export type IndianState = typeof INDIAN_STATES[number];

export class TaxCalculator {
  private static DEFAULT_TAX_RATE = 18; // 18% GST for cloud services

  static calculateGST(input: TaxCalculationInput): TaxCalculationResult {
    const {
      amountInPaise,
      sellerAddress,
      buyerAddress,
      hsnSacCode,
      taxRate = this.DEFAULT_TAX_RATE,
    } = input;

    const sellerState = sellerAddress.state;
    const buyerState = buyerAddress.state;
    const taxableAmountInPaise = amountInPaise;

    // Check if same state or different state
    const isSameState = this.normalizeState(sellerState) === this.normalizeState(buyerState);

    let cgstRate = 0;
    let sgstRate = 0;
    let igstRate = 0;
    let cgstAmountInPaise = 0;
    let sgstAmountInPaise = 0;
    let igstAmountInPaise = 0;
    let taxType: "CGST+SGST" | "IGST";

    if (isSameState) {
      // Same state: Split 18% into CGST (9%) + SGST (9%)
      cgstRate = taxRate / 2;
      sgstRate = taxRate / 2;
      cgstAmountInPaise = Math.round((taxableAmountInPaise * cgstRate) / 100);
      sgstAmountInPaise = Math.round((taxableAmountInPaise * sgstRate) / 100);
      taxType = "CGST+SGST";
    } else {
      // Different state: Apply full 18% as IGST
      igstRate = taxRate;
      igstAmountInPaise = Math.round((taxableAmountInPaise * igstRate) / 100);
      taxType = "IGST";
    }

    const totalTaxInPaise = cgstAmountInPaise + sgstAmountInPaise + igstAmountInPaise;
    const totalAmountInPaise = taxableAmountInPaise + totalTaxInPaise;

    return {
      taxableAmountInPaise,
      cgstRate,
      sgstRate,
      igstRate,
      cgstAmountInPaise,
      sgstAmountInPaise,
      igstAmountInPaise,
      totalTaxInPaise,
      totalAmountInPaise,
      taxType,
      sellerState,
      buyerState,
      hsnSacCode,
    };
  }

  static calculateMultipleItems(
    items: Array<{ amountInPaise: number; hsnSacCode: string; taxRate?: number }>,
    sellerAddress: BillingAddress,
    buyerAddress: BillingAddress,
  ): {
    items: TaxCalculationResult[];
    totalTaxableAmountInPaise: number;
    totalCGSTInPaise: number;
    totalSGSTInPaise: number;
    totalIGSTInPaise: number;
    totalTaxInPaise: number;
    grandTotalInPaise: number;
  } {
    const calculations = items.map(item =>
      this.calculateGST({
        amountInPaise: item.amountInPaise,
        sellerAddress,
        buyerAddress,
        hsnSacCode: item.hsnSacCode,
        taxRate: item.taxRate,
      })
    );

    const totalTaxableAmountInPaise = calculations.reduce((sum, calc) => sum + calc.taxableAmountInPaise, 0);
    const totalCGSTInPaise = calculations.reduce((sum, calc) => sum + calc.cgstAmountInPaise, 0);
    const totalSGSTInPaise = calculations.reduce((sum, calc) => sum + calc.sgstAmountInPaise, 0);
    const totalIGSTInPaise = calculations.reduce((sum, calc) => sum + calc.igstAmountInPaise, 0);
    const totalTaxInPaise = calculations.reduce((sum, calc) => sum + calc.totalTaxInPaise, 0);
    const grandTotalInPaise = calculations.reduce((sum, calc) => sum + calc.totalAmountInPaise, 0);

    return {
      items: calculations,
      totalTaxableAmountInPaise,
      totalCGSTInPaise,
      totalSGSTInPaise,
      totalIGSTInPaise,
      totalTaxInPaise,
      grandTotalInPaise,
    };
  }

  static validateGSTNumber(gstin: string): boolean {
    // GSTIN format: 22AAAAA0000A1Z5
    // 2 chars: State code
    // 10 chars: PAN
    // 1 char: Entity number
    // 1 char: Z (default)
    // 1 char: Checksum
    const gstinRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
    return gstinRegex.test(gstin);
  }

  static validatePAN(pan: string): boolean {
    // PAN format: AAAAA9999A
    // 5 chars: Alphabets
    // 4 chars: Numbers
    // 1 char: Alphabet
    const panRegex = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;
    return panRegex.test(pan);
  }

  private static normalizeState(state: string): string {
    // Normalize state name for comparison (lowercase, trim)
    return state.toLowerCase().trim();
  }

  private static roundToTwoDecimals(value: number): number {
    return Math.round(value * 100) / 100;
  }

  static getStateFromGSTIN(gstin: string): string | null {
    if (!this.validateGSTNumber(gstin)) {
      return null;
    }

    const stateCode = gstin.substring(0, 2);
    const stateCodeMap: Record<string, string> = {
      "01": "Jammu and Kashmir",
      "02": "Himachal Pradesh",
      "03": "Punjab",
      "04": "Chandigarh",
      "05": "Uttarakhand",
      "06": "Haryana",
      "07": "Delhi",
      "08": "Rajasthan",
      "09": "Uttar Pradesh",
      "10": "Bihar",
      "11": "Sikkim",
      "12": "Arunachal Pradesh",
      "13": "Nagaland",
      "14": "Manipur",
      "15": "Mizoram",
      "16": "Tripura",
      "17": "Meghalaya",
      "18": "Assam",
      "19": "West Bengal",
      "20": "Jharkhand",
      "21": "Odisha",
      "22": "Chhattisgarh",
      "23": "Madhya Pradesh",
      "24": "Gujarat",
      "26": "Dadra and Nagar Haveli and Daman and Diu",
      "27": "Maharashtra",
      "29": "Karnataka",
      "30": "Goa",
      "31": "Lakshadweep",
      "32": "Kerala",
      "33": "Tamil Nadu",
      "34": "Puducherry",
      "35": "Andaman and Nicobar Islands",
      "36": "Telangana",
      "37": "Andhra Pradesh",
      "38": "Ladakh",
    };

    return stateCodeMap[stateCode] || null;
  }

  static getHSNSACForService(serviceType: string): string {
    // HSN/SAC codes for common cloud services
    const hsnSacMap: Record<string, string> = {
      "compute": "998314", // Cloud computing services
      "storage": "998315", // Data storage services
      "database": "998316", // Database services
      "network": "998317", // Network services
      "kubernetes": "998314", // Container/compute services
      "cdn": "998318", // Content delivery services
      "backup": "998315", // Backup/storage services
      "dns": "998319", // DNS services
      "monitoring": "998320", // Monitoring services
      "support": "998321", // Technical support services
      "license": "998322", // License fees
      "setup": "998323", // Setup/installation services
    };

    return hsnSacMap[serviceType.toLowerCase()] || "998314"; // Default to cloud computing
  }
}
