// x402 Payment Protocol Types
// Based on Coinbase x402 protocol (HTTP 402 Payment Required)

export interface X402Challenge {
  paymentId: string;
  amount: string;
  currency: string;
  destination: string; // Payment destination address
  description?: string;
  expiresAt: string; // ISO 8601 timestamp
  metadata?: Record<string, any>;
}

export interface X402PaymentRequest {
  challenge: X402Challenge;
  paymentUrl: string; // URL to complete payment
}

export interface X402PaymentProof {
  paymentId: string;
  proof: string; // Payment proof/token
  timestamp: string;
  signature?: string;
}

export interface X402Quote {
  amount: string;
  currency: string;
  estimatedFee: string;
  total: string;
  expiresAt: string;
}

export interface X402Settlement {
  paymentId: string;
  amount: string;
  currency: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  settledAt?: string;
  transactionHash?: string;
}

export interface X402MeteringRecord {
  rentalId: string;
  startTime: string;
  endTime: string;
  durationSeconds: number;
  amount: string;
  cost: string;
}

