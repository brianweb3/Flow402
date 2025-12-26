import { calculateRentalCost, calculateProviderEarnings } from '@/lib/payments/calculator';

describe('Rental Cost Calculator', () => {
  describe('RAM calculations', () => {
    it('should calculate cost for RAM rental correctly', () => {
      const result = calculateRentalCost({
        resourceType: 'RAM',
        amount: 64, // GB
        durationMinutes: 60, // 1 hour
        pricePerUnitPerTime: 0.01, // per GB-hour
        platformFeePercent: 5,
      });

      expect(result.subtotal).toBeCloseTo(0.64, 2); // 64 GB * 1 hour * 0.01
      expect(result.platformFee).toBeCloseTo(0.032, 2); // 5% of 0.64
      expect(result.total).toBeCloseTo(0.672, 2); // 0.64 + 0.032
      expect(result.currency).toBe('USDC');
    });

    it('should calculate cost for longer RAM rental', () => {
      const result = calculateRentalCost({
        resourceType: 'RAM',
        amount: 128,
        durationMinutes: 1440, // 24 hours
        pricePerUnitPerTime: 0.01,
        platformFeePercent: 5,
      });

      expect(result.subtotal).toBeCloseTo(30.72, 2); // 128 GB * 24 hours * 0.01
      expect(result.total).toBeCloseTo(32.256, 2);
    });
  });

  describe('GPU calculations', () => {
    it('should calculate cost for GPU rental correctly', () => {
      const result = calculateRentalCost({
        resourceType: 'GPU',
        amount: 2, // 2 GPUs
        durationMinutes: 60,
        pricePerUnitPerTime: 0.5, // per GPU-minute
        platformFeePercent: 5,
      });

      expect(result.subtotal).toBe(60); // 2 GPUs * 60 minutes * 0.5
      expect(result.platformFee).toBe(3); // 5% of 60
      expect(result.total).toBe(63);
    });
  });

  describe('Provider Earnings Calculator', () => {
    it('should calculate provider earnings for RAM', () => {
      const result = calculateProviderEarnings({
        pricePerUnitPerTime: 0.01,
        amount: 64,
        durationMinutes: 60,
        utilizationPercent: 75,
        resourceType: 'RAM',
      });

      // Hourly rate: 64 GB * 0.01 per GB-hour = 0.64 USDC/hour
      expect(result.hourlyRate).toBeCloseTo(0.64, 2);
      // Daily: 0.64 * 24 * 0.75 = 11.52
      expect(result.dailyEarnings).toBeCloseTo(11.52, 2);
      // Monthly: 11.52 * 30 = 345.6
      expect(result.monthlyEarnings).toBeCloseTo(345.6, 2);
    });

    it('should calculate provider earnings for GPU', () => {
      const result = calculateProviderEarnings({
        pricePerUnitPerTime: 0.5,
        amount: 2,
        durationMinutes: 60,
        utilizationPercent: 50,
        resourceType: 'GPU',
      });

      // Hourly rate: 2 GPUs * 0.5 per GPU-minute * 60 = 60 USDC/hour
      expect(result.hourlyRate).toBe(60);
      // Daily: 60 * 24 * 0.5 = 720
      expect(result.dailyEarnings).toBe(720);
      // Monthly: 720 * 30 = 21600
      expect(result.monthlyEarnings).toBe(21600);
    });
  });
});

