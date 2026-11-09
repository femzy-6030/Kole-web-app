// src/utils/feeCalculator.ts

export type EntityType =
  | 'SMALL_HOUSEHOLD'
  | 'LARGE_HOUSEHOLD'
  | 'SMALL_BUSINESS'
  | 'MEDIUM_ORGANIZATION'
  | 'BIG_ORGANIZATION';

export interface EntityTypeOption {
  key: EntityType;
  label: string;
  category: 'household' | 'commercial';
  description: string;
  recommendedTariff: number;
  tariffRange: string;
}

export const ENTITY_TYPES: EntityTypeOption[] = [
  {
    key: 'SMALL_HOUSEHOLD',
    label: 'Small Household',
    category: 'household',
    description: '1-2 rooms / Micro residential (< ₦2,000 tariff)',
    recommendedTariff: 1500,
    tariffRange: '₦1,000 – ₦1,900',
  },
  {
    key: 'LARGE_HOUSEHOLD',
    label: 'Large Household',
    category: 'household',
    description: 'Standard flat / Duplex / Compound (≥ ₦2,500 tariff)',
    recommendedTariff: 4000,
    tariffRange: '₦2,500 – ₦5,000',
  },
  {
    key: 'SMALL_BUSINESS',
    label: 'Small Business',
    category: 'commercial',
    description: 'Shops, Salons, Boutiques, Micro-retail, Pharmacies',
    recommendedTariff: 6000,
    tariffRange: '₦6,000 – ₦10,000',
  },
  {
    key: 'MEDIUM_ORGANIZATION',
    label: 'Medium Organization',
    category: 'commercial',
    description: 'Supermarkets, Clinics, Corporate offices, Schools',
    recommendedTariff: 15000,
    tariffRange: '₦10,000 – ₦25,000',
  },
  {
    key: 'BIG_ORGANIZATION',
    label: 'Big Organization',
    category: 'commercial',
    description: 'Shopping malls, Hotels, Factories, Plazas, Institutions',
    recommendedTariff: 35000,
    tariffRange: '₦30,000 – ₦50,000+',
  },
];

export interface FeeCalculationResult {
  baseTariff: number;
  platformFee: number;
  gatewayFee: number;
  totalCharged: number;
  totalAmountInKobo: number;
  subtotal: number;
  entityType: string;
  isMicroTier: boolean;
  isGatewayWaived: boolean;
  paystackCapApplied: boolean;
}

/**
 * Paystack Standard Fee Cap for Nigerian transactions (₦2,000 cap)
 */
export const PAYSTACK_FEE_CAP = 2000;

/**
 * Calculates user-bearing checkout breakdown and platform fees for KóLẹ̀
 * 
 * Rules:
 * 1. Small Households (< ₦2,000 tariff): Customer pays base tariff + ₦100 platform fee.
 *    Paystack waives its percentage fee on the micro-tier.
 * 2. Large Households & Organizations (≥ ₦2,500 tariff): Customer pays base tariff + ₦200 platform fee
 *    + Paystack gateway fee (1.5% + ₦100, capped at ₦2,000). The user bears all gateway and service costs.
 * 
 * @param entityType - 'SMALL_HOUSEHOLD' | 'LARGE_HOUSEHOLD' | 'SMALL_BUSINESS' | 'MEDIUM_ORGANIZATION' | 'BIG_ORGANIZATION'
 * @param baseTariff - Monthly waste evacuation tariff set by or for the client
 */
export function calculateCheckoutTotal(
  entityType: string = 'LARGE_HOUSEHOLD',
  baseTariff: number = 4000
): FeeCalculationResult {
  const safeTariff = Math.max(0, Number(baseTariff) || 0);
  const normalizedType = (entityType || 'LARGE_HOUSEHOLD').toUpperCase().trim();

  // 1. Platform Fee
  // Default is ₦200. If Small Household AND tariff < 2000, reduced to ₦100 micro-tier fee.
  let platformFee = 200;
  const isMicroTier = normalizedType === 'SMALL_HOUSEHOLD' && safeTariff < 2000;
  if (isMicroTier) {
    platformFee = 100;
  }

  // 2. Gateway Fee (Paystack User-Bearing Fee)
  // If tariff >= 2500, customer bears gateway fee (1.5% + ₦100) on top of tariff + platform fee
  let gatewayFee = 0;
  let paystackCapApplied = false;

  if (safeTariff >= 2500) {
    const subtotal = safeTariff + platformFee;
    const computedFee = (subtotal * 0.015) + 100;
    
    // Apply Paystack fee cap (₦2,000 max)
    if (computedFee > PAYSTACK_FEE_CAP) {
      gatewayFee = PAYSTACK_FEE_CAP;
      paystackCapApplied = true;
    } else {
      gatewayFee = computedFee;
    }
  }

  const roundedGatewayFee = Math.round(gatewayFee * 100) / 100;
  const totalCharged = Math.round((safeTariff + platformFee + roundedGatewayFee) * 100) / 100;
  const totalAmountInKobo = Math.round(totalCharged * 100);

  return {
    baseTariff: safeTariff,
    platformFee,
    gatewayFee: roundedGatewayFee,
    totalCharged,
    totalAmountInKobo,
    subtotal: safeTariff + platformFee,
    entityType: normalizedType,
    isMicroTier,
    isGatewayWaived: roundedGatewayFee === 0,
    paystackCapApplied,
  };
}

/**
 * Format currency in Nigerian Naira (₦)
 */
export function formatNaira(amount: number, includeDecimals: boolean = false): string {
  const safe = Number(amount) || 0;
  if (includeDecimals && safe % 1 !== 0) {
    return `₦${safe.toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }
  return `₦${Math.round(safe).toLocaleString('en-NG')}`;
}

/**
 * Get recommended default tariff for a given entity type
 */
export function getRecommendedTariff(entityType: string): number {
  const match = ENTITY_TYPES.find((t) => t.key === (entityType || '').toUpperCase());
  return match ? match.recommendedTariff : 4000;
}

