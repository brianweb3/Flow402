import { z } from 'zod';

// Common validation schemas
export const emailSchema = z.string().email('Invalid email address');
export const passwordSchema = z.string().min(8, 'Password must be at least 8 characters');

// Auth schemas
export const signupSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  name: z.string().min(1).optional(),
});

export const loginSchema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required'),
});

// Offer schemas
export const createOfferSchema = z.object({
  nodeId: z.string().cuid().optional(),
  resourceType: z.enum(['RAM', 'GPU']),
  amount: z.number().positive('Amount must be positive'),
  region: z.string().min(1, 'Region is required'),
  pricePerUnitPerTime: z.number().positive('Price must be positive'),
  currency: z.string().default('USDC'),
  minDurationMinutes: z.number().int().positive().default(60),
  maxDurationMinutes: z.number().int().positive().optional(),
  maxConcurrentRentals: z.number().int().positive().default(1),
  availabilitySchedule: z.record(z.any()).optional(),
  slaUptimePercent: z.number().min(0).max(100).optional(),
  slaResponseTimeMs: z.number().int().positive().optional(),
});

export const updateOfferSchema = createOfferSchema.partial().extend({
  published: z.boolean().optional(),
  active: z.boolean().optional(),
});

// Rental schemas
export const createRentalSchema = z.object({
  offerId: z.string().cuid(),
  amount: z.number().positive('Amount must be positive'),
  durationMinutes: z.number().int().positive('Duration must be positive'),
  startNow: z.boolean().default(false),
});

// Payment schemas
export const paymentQuoteSchema = z.object({
  rentalId: z.string().cuid(),
  amount: z.number().positive(),
  currency: z.string().default('USDC'),
});

export const paymentAuthorizeSchema = z.object({
  paymentId: z.string(),
  proof: z.string().min(1, 'Payment proof is required'),
});

// Node schemas
export const createNodeSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  region: z.string().min(1, 'Region is required'),
  totalRamGB: z.number().positive('RAM must be positive'),
  totalGpuCount: z.number().int().nonnegative().default(0),
  gpuVramGB: z.number().positive().optional(),
  metadata: z.record(z.any()).optional(),
});

export const updateNodeSchema = createNodeSchema.partial();

