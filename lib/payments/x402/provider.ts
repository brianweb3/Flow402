// Abstract BillingProvider interface for x402 payment protocol
import {
  X402Challenge,
  X402PaymentRequest,
  X402PaymentProof,
  X402Quote,
  X402Settlement,
  X402MeteringRecord,
} from './types';

export interface BillingProvider {
  // Generate a payment quote
  createQuote(params: {
    amount: number;
    currency: string;
    description?: string;
  }): Promise<X402Quote>;

  // Create a payment challenge (HTTP 402)
  createPaymentChallenge(params: {
    amount: number;
    currency: string;
    description?: string;
    metadata?: Record<string, any>;
  }): Promise<X402PaymentRequest>;

  // Verify payment proof
  verifyPayment(proof: X402PaymentProof): Promise<{
    valid: boolean;
    paymentId: string;
    amount: string;
    currency: string;
  }>;

  // Authorize a payment (pre-authorization)
  authorizePayment(params: {
    paymentId: string;
    amount: number;
    currency: string;
  }): Promise<{ authorized: boolean; authorizationId: string }>;

  // Settle a payment
  settlePayment(params: {
    paymentId: string;
    amount: number;
    currency: string;
  }): Promise<X402Settlement>;

  // Record usage for metering
  recordUsage(record: X402MeteringRecord): Promise<void>;

  // Process settlement for usage records
  processSettlement(params: {
    rentalId: string;
    usageRecords: X402MeteringRecord[];
  }): Promise<X402Settlement>;
}

