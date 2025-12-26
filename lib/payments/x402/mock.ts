// Mock x402 Payment Provider for MVP/Development
// Simulates HTTP 402 challenges and payment proofs
import { BillingProvider } from './provider';
import {
  X402Challenge,
  X402PaymentRequest,
  X402PaymentProof,
  X402Quote,
  X402Settlement,
  X402MeteringRecord,
} from './types';
import { randomBytes } from 'crypto';

export class MockX402Provider implements BillingProvider {
  private payments: Map<string, {
    amount: number;
    currency: string;
    status: 'pending' | 'authorized' | 'settled' | 'failed';
    proof?: string;
    createdAt: Date;
  }> = new Map();

  async createQuote(params: {
    amount: number;
    currency: string;
    description?: string;
  }): Promise<X402Quote> {
    const fee = params.amount * 0.01; // 1% fee
    const total = params.amount + fee;
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    return {
      amount: params.amount.toFixed(6),
      currency: params.currency,
      estimatedFee: fee.toFixed(6),
      total: total.toFixed(6),
      expiresAt: expiresAt.toISOString(),
    };
  }

  async createPaymentChallenge(params: {
    amount: number;
    currency: string;
    description?: string;
    metadata?: Record<string, any>;
  }): Promise<X402PaymentRequest> {
    const paymentId = `mock_${randomBytes(16).toString('hex')}`;
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

    const challenge: X402Challenge = {
      paymentId,
      amount: params.amount.toFixed(6),
      currency: params.currency,
      destination: 'mock_destination_address',
      description: params.description,
      expiresAt: expiresAt.toISOString(),
      metadata: params.metadata,
    };

    // Store payment state
    this.payments.set(paymentId, {
      amount: params.amount,
      currency: params.currency,
      status: 'pending',
      createdAt: new Date(),
    });

    return {
      challenge,
      paymentUrl: `/api/payments/authorize?paymentId=${paymentId}`,
    };
  }

  async verifyPayment(proof: X402PaymentProof): Promise<{
    valid: boolean;
    paymentId: string;
    amount: string;
    currency: string;
  }> {
    const payment = this.payments.get(proof.paymentId);
    
    if (!payment) {
      return {
        valid: false,
        paymentId: proof.paymentId,
        amount: '0',
        currency: 'USDC',
      };
    }

    // In mock, accept any proof that matches the payment ID
    // In production, this would verify cryptographic signatures
    const isValid = proof.proof.startsWith('mock_proof_') && 
                    proof.paymentId === payment.paymentId;

    if (isValid && payment.status === 'pending') {
      payment.status = 'authorized';
      payment.proof = proof.proof;
    }

    return {
      valid: isValid,
      paymentId: proof.paymentId,
      amount: payment.amount.toFixed(6),
      currency: payment.currency,
    };
  }

  async authorizePayment(params: {
    paymentId: string;
    amount: number;
    currency: string;
  }): Promise<{ authorized: boolean; authorizationId: string }> {
    const payment = this.payments.get(params.paymentId);
    
    if (!payment || payment.status !== 'pending') {
      return { authorized: false, authorizationId: '' };
    }

    if (Math.abs(payment.amount - params.amount) > 0.01) {
      return { authorized: false, authorizationId: '' };
    }

    payment.status = 'authorized';
    const authorizationId = `auth_${randomBytes(16).toString('hex')}`;

    return { authorized: true, authorizationId };
  }

  async settlePayment(params: {
    paymentId: string;
    amount: number;
    currency: string;
  }): Promise<X402Settlement> {
    const payment = this.payments.get(params.paymentId);
    
    if (!payment || payment.status !== 'authorized') {
      throw new Error('Payment not authorized');
    }

    payment.status = 'settled';
    const transactionHash = `mock_tx_${randomBytes(16).toString('hex')}`;

    return {
      paymentId: params.paymentId,
      amount: params.amount.toFixed(6),
      currency: params.currency,
      status: 'completed',
      settledAt: new Date().toISOString(),
      transactionHash,
    };
  }

  async recordUsage(record: X402MeteringRecord): Promise<void> {
    // In mock, just log usage
    // In production, this would send to metering service
    console.log('[Mock] Usage recorded:', record);
  }

  async processSettlement(params: {
    rentalId: string;
    usageRecords: X402MeteringRecord[];
  }): Promise<X402Settlement> {
    const totalAmount = params.usageRecords.reduce((sum, record) => {
      return sum + parseFloat(record.cost);
    }, 0);

    const paymentId = `settle_${randomBytes(16).toString('hex')}`;
    const transactionHash = `mock_settle_tx_${randomBytes(16).toString('hex')}`;

    return {
      paymentId,
      amount: totalAmount.toFixed(6),
      currency: 'USDC',
      status: 'completed',
      settledAt: new Date().toISOString(),
      transactionHash,
    };
  }
}

// Singleton instance
let mockProvider: MockX402Provider | null = null;
let solanaProvider: BillingProvider | null = null;

export function getBillingProvider(): BillingProvider {
  const provider = process.env.X402_PROVIDER || process.env.NEXT_PUBLIC_X402_PROVIDER || 'auto';
  
  // Auto-detect: use Solana if configured, otherwise use mock
  if (provider === 'auto') {
    const walletAddress = process.env.NEXT_PUBLIC_WALLET_ADDRESS || process.env.SOLANA_WALLET_ADDRESS;
    const cdpClientKey = process.env.NEXT_PUBLIC_CDP_CLIENT_KEY || process.env.CDP_CLIENT_KEY;
    
    if (walletAddress && cdpClientKey) {
      // Use Solana X402 provider
      try {
        if (!solanaProvider) {
          const { createSolanaX402Provider } = require('./solana-provider');
          solanaProvider = createSolanaX402Provider();
        }
        if (solanaProvider) {
          return solanaProvider;
        }
      } catch (error) {
        console.warn('Failed to initialize Solana X402 provider, falling back to mock:', error);
      }
    }
    
    // Fall back to mock provider
    if (!mockProvider) {
      mockProvider = new MockX402Provider();
    }
    return mockProvider;
  }
  
  if (provider === 'mock') {
    if (!mockProvider) {
      mockProvider = new MockX402Provider();
    }
    return mockProvider;
  }

  if (provider === 'solana') {
    if (!solanaProvider) {
      const { createSolanaX402Provider } = require('./solana-provider');
      solanaProvider = createSolanaX402Provider();
    }
    if (!solanaProvider) {
      throw new Error('Solana X402 provider not configured. Please set NEXT_PUBLIC_WALLET_ADDRESS and NEXT_PUBLIC_CDP_CLIENT_KEY');
    }
    return solanaProvider;
  }
  
  throw new Error(`Unsupported payment provider: ${provider}`);
}

