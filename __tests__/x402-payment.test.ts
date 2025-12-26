import { MockX402Provider } from '@/lib/payments/x402/mock';

describe('x402 Payment Protocol (Mock)', () => {
  let provider: MockX402Provider;

  beforeEach(() => {
    provider = new MockX402Provider();
  });

  describe('Payment Quote', () => {
    it('should create a payment quote', async () => {
      const quote = await provider.createQuote({
        amount: 10.5,
        currency: 'USDC',
        description: 'Test rental',
      });

      expect(quote.amount).toBe('10.500000');
      expect(quote.currency).toBe('USDC');
      expect(parseFloat(quote.estimatedFee)).toBeGreaterThan(0);
      expect(parseFloat(quote.total)).toBeGreaterThan(parseFloat(quote.amount));
    });
  });

  describe('Payment Challenge', () => {
    it('should create a payment challenge', async () => {
      const paymentRequest = await provider.createPaymentChallenge({
        amount: 10.5,
        currency: 'USDC',
        description: 'Test rental',
      });

      expect(paymentRequest.challenge.paymentId).toMatch(/^mock_/);
      expect(paymentRequest.challenge.amount).toBe('10.500000');
      expect(paymentRequest.challenge.currency).toBe('USDC');
      expect(paymentRequest.paymentUrl).toContain('/api/payments/authorize');
    });
  });

  describe('Payment Verification', () => {
    it('should verify a valid payment proof', async () => {
      const paymentRequest = await provider.createPaymentChallenge({
        amount: 10.5,
        currency: 'USDC',
      });

      const verification = await provider.verifyPayment({
        paymentId: paymentRequest.challenge.paymentId,
        proof: `mock_proof_${paymentRequest.challenge.paymentId}`,
        timestamp: new Date().toISOString(),
      });

      expect(verification.valid).toBe(true);
      expect(verification.paymentId).toBe(paymentRequest.challenge.paymentId);
    });

    it('should reject invalid payment proof', async () => {
      const paymentRequest = await provider.createPaymentChallenge({
        amount: 10.5,
        currency: 'USDC',
      });

      const verification = await provider.verifyPayment({
        paymentId: paymentRequest.challenge.paymentId,
        proof: 'invalid_proof',
        timestamp: new Date().toISOString(),
      });

      expect(verification.valid).toBe(false);
    });
  });

  describe('Payment Authorization', () => {
    it('should authorize a valid payment', async () => {
      const paymentRequest = await provider.createPaymentChallenge({
        amount: 10.5,
        currency: 'USDC',
      });

      // First verify payment
      await provider.verifyPayment({
        paymentId: paymentRequest.challenge.paymentId,
        proof: `mock_proof_${paymentRequest.challenge.paymentId}`,
        timestamp: new Date().toISOString(),
      });

      const authorization = await provider.authorizePayment({
        paymentId: paymentRequest.challenge.paymentId,
        amount: 10.5,
        currency: 'USDC',
      });

      expect(authorization.authorized).toBe(true);
      expect(authorization.authorizationId).toMatch(/^auth_/);
    });
  });

  describe('Payment Settlement', () => {
    it('should settle an authorized payment', async () => {
      const paymentRequest = await provider.createPaymentChallenge({
        amount: 10.5,
        currency: 'USDC',
      });

      // Verify and authorize
      await provider.verifyPayment({
        paymentId: paymentRequest.challenge.paymentId,
        proof: `mock_proof_${paymentRequest.challenge.paymentId}`,
        timestamp: new Date().toISOString(),
      });

      await provider.authorizePayment({
        paymentId: paymentRequest.challenge.paymentId,
        amount: 10.5,
        currency: 'USDC',
      });

      // Settle
      const settlement = await provider.settlePayment({
        paymentId: paymentRequest.challenge.paymentId,
        amount: 10.5,
        currency: 'USDC',
      });

      expect(settlement.status).toBe('completed');
      expect(settlement.amount).toBe('10.500000');
      expect(settlement.transactionHash).toMatch(/^mock_tx_/);
    });
  });

  describe('HTTP 402 Flow Integration', () => {
    it('should complete full payment flow', async () => {
      // 1. Create challenge
      const paymentRequest = await provider.createPaymentChallenge({
        amount: 25.0,
        currency: 'USDC',
        description: 'Rental payment',
      });

      expect(paymentRequest.challenge.paymentId).toBeDefined();

      // 2. Verify payment (simulating client payment)
      const verification = await provider.verifyPayment({
        paymentId: paymentRequest.challenge.paymentId,
        proof: `mock_proof_${paymentRequest.challenge.paymentId}`,
        timestamp: new Date().toISOString(),
      });

      expect(verification.valid).toBe(true);

      // 3. Authorize
      const authorization = await provider.authorizePayment({
        paymentId: paymentRequest.challenge.paymentId,
        amount: parseFloat(verification.amount),
        currency: verification.currency,
      });

      expect(authorization.authorized).toBe(true);

      // 4. Settle
      const settlement = await provider.settlePayment({
        paymentId: paymentRequest.challenge.paymentId,
        amount: parseFloat(verification.amount),
        currency: verification.currency,
      });

      expect(settlement.status).toBe('completed');
      expect(settlement.settledAt).toBeDefined();
    });
  });
});

