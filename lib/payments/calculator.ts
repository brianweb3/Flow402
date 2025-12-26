// Pricing calculator for rentals
export interface CalculatorInput {
  resourceType: 'RAM' | 'GPU';
  amount: number; // GB for RAM, count for GPU
  durationMinutes: number;
  pricePerUnitPerTime: number; // per GB-hour (RAM) or per GPU-minute (GPU)
  currency?: string;
  platformFeePercent?: number;
}

export interface CalculatorResult {
  resourceType: 'RAM' | 'GPU';
  amount: number;
  durationMinutes: number;
  unitPrice: number;
  subtotal: number;
  platformFee: number;
  total: number;
  currency: string;
  breakdown: {
    resourceCost: number;
    platformFee: number;
    total: number;
  };
}

const PLATFORM_FEE_PERCENT = parseFloat(process.env.PLATFORM_FEE_PERCENT || '5.0');

export function calculateRentalCost(input: CalculatorInput): CalculatorResult {
  const {
    resourceType,
    amount,
    durationMinutes,
    pricePerUnitPerTime,
    currency = 'USDC',
    platformFeePercent = PLATFORM_FEE_PERCENT,
  } = input;

  let resourceCost: number;

  if (resourceType === 'RAM') {
    // RAM: price is per GB-hour
    // Convert durationMinutes to hours
    const durationHours = durationMinutes / 60;
    resourceCost = amount * durationHours * pricePerUnitPerTime;
  } else {
    // GPU: price is per GPU-minute
    resourceCost = amount * durationMinutes * pricePerUnitPerTime;
  }

  const platformFee = resourceCost * (platformFeePercent / 100);
  const total = resourceCost + platformFee;

  return {
    resourceType,
    amount,
    durationMinutes,
    unitPrice: pricePerUnitPerTime,
    subtotal: resourceCost,
    platformFee,
    total,
    currency,
    breakdown: {
      resourceCost,
      platformFee,
      total,
    },
  };
}

export function calculateProviderEarnings(params: {
  pricePerUnitPerTime: number;
  amount: number;
  durationMinutes: number;
  utilizationPercent: number;
  resourceType: 'RAM' | 'GPU';
}): {
  hourlyRate: number;
  dailyEarnings: number;
  monthlyEarnings: number;
  utilizationBreakdown: {
    at50Percent: number;
    at75Percent: number;
    at100Percent: number;
  };
} {
  const { pricePerUnitPerTime, amount, durationMinutes, utilizationPercent, resourceType } = params;

  let hourlyRate: number;
  if (resourceType === 'RAM') {
    hourlyRate = amount * pricePerUnitPerTime;
  } else {
    // GPU: convert per-minute to per-hour
    hourlyRate = amount * pricePerUnitPerTime * 60;
  }

  const dailyEarnings = hourlyRate * 24 * (utilizationPercent / 100);
  const monthlyEarnings = dailyEarnings * 30;

  return {
    hourlyRate,
    dailyEarnings,
    monthlyEarnings,
    utilizationBreakdown: {
      at50Percent: hourlyRate * 24 * 0.5 * 30,
      at75Percent: hourlyRate * 24 * 0.75 * 30,
      at100Percent: hourlyRate * 24 * 1.0 * 30,
    },
  };
}

