import { NextRequest } from 'next/server';
import { requireAuth } from '@/lib/auth/middleware';
import { getBillingProvider } from '@/lib/payments/x402/mock';
import { paymentAuthorizeSchema } from '@/lib/utils/validation';
import { successResponse, errorResponse } from '@/lib/utils/api-response';
import { PaymentError } from '@/lib/utils/errors';

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth(request);
    const body = await request.json();
    const validated = paymentAuthorizeSchema.parse(body);

    const provider = getBillingProvider();
    
    // Verify payment proof
    const verification = await provider.verifyPayment({
      paymentId: validated.paymentId,
      proof: validated.proof,
      timestamp: new Date().toISOString(),
    });

    if (!verification.valid) {
      throw new PaymentError('Invalid payment proof', 'INVALID_PROOF');
    }

    // Authorize payment
    const authorization = await provider.authorizePayment({
      paymentId: validated.paymentId,
      amount: parseFloat(verification.amount),
      currency: verification.currency,
    });

    if (!authorization.authorized) {
      throw new PaymentError('Payment authorization failed', 'AUTHORIZATION_FAILED');
    }

    return successResponse({
      authorized: true,
      authorizationId: authorization.authorizationId,
      paymentId: validated.paymentId,
    });
  } catch (error) {
    return errorResponse(error);
  }
}

