import { NextRequest } from 'next/server';
import { requireAuth } from '@/lib/auth/middleware';
import { getBillingProvider } from '@/lib/payments/x402/mock';
import { prisma } from '@/lib/db/prisma';
import { paymentAuthorizeSchema } from '@/lib/utils/validation';
import { successResponse, errorResponse } from '@/lib/utils/api-response';
import { NotFoundError, PaymentError } from '@/lib/utils/errors';
import { randomBytes } from 'crypto';

// Complete payment and activate rental
export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth(request);
    const body = await request.json();
    const validated = paymentAuthorizeSchema.parse(body);

    // Find payment and rental
    const payment = await prisma.payment.findUnique({
      where: { paymentId: validated.paymentId },
      include: { rental: true },
    });

    if (!payment) {
      throw new NotFoundError('Payment not found');
    }

    if (payment.userId !== user.userId) {
      throw new Error('Unauthorized');
    }

    if (payment.status !== 'PENDING') {
      throw new PaymentError('Payment already processed', 'ALREADY_PROCESSED');
    }

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

    // Authorize and settle payment
    const authorization = await provider.authorizePayment({
      paymentId: validated.paymentId,
      amount: payment.amount,
      currency: payment.currency,
    });

    if (!authorization.authorized) {
      throw new PaymentError('Payment authorization failed', 'AUTHORIZATION_FAILED');
    }

    const settlement = await provider.settlePayment({
      paymentId: validated.paymentId,
      amount: payment.amount,
      currency: payment.currency,
    });

    // Update payment status
    await prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: 'SETTLED',
        proof: validated.proof,
        settledAt: new Date(),
      },
    });

    // Create settlement record
    await prisma.settlement.create({
      data: {
        paymentId: payment.id,
        amount: parseFloat(settlement.amount),
        currency: settlement.currency,
        status: 'COMPLETED',
        settledAt: new Date(settlement.settledAt!),
      },
    });

    // Activate rental if pending
    let rental = payment.rental;
    if (rental && rental.status === 'PENDING') {
      const startTime = new Date();
      const endTime = new Date(startTime.getTime() + rental.durationMinutes * 60 * 1000);

      rental = await prisma.rental.update({
        where: { id: rental.id },
        data: {
          status: 'ACTIVE',
          startTime,
          endTime,
          accessToken: `token_${randomBytes(32).toString('hex')}`,
          accessUrl: `https://api.flow-ramarket.com/access/${rental.offerId}`,
        },
        include: {
          offer: true,
        },
      });

      // Update invoice
      await prisma.invoice.update({
        where: { rentalId: rental.id },
        data: {
          status: 'PAID',
          paidAt: new Date(),
        },
      });
    }

    return successResponse({
      payment: {
        id: payment.id,
        status: 'SETTLED',
        settledAt: settlement.settledAt,
      },
      rental: rental ? {
        id: rental.id,
        status: rental.status,
        accessToken: rental.accessToken,
        accessUrl: rental.accessUrl,
        startTime: rental.startTime,
        endTime: rental.endTime,
      } : null,
    });
  } catch (error) {
    return errorResponse(error);
  }
}

