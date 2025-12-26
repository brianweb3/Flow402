import { NextRequest } from 'next/server';
import { requireAuth } from '@/lib/auth/middleware';
import { getBillingProvider } from '@/lib/payments/x402/mock';
import { prisma } from '@/lib/db/prisma';
import { successResponse, errorResponse } from '@/lib/utils/api-response';
import { NotFoundError } from '@/lib/utils/errors';
import { z } from 'zod';

const settleSchema = z.object({
  paymentId: z.string(),
  rentalId: z.string().cuid().optional(),
});

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth(request);
    const body = await request.json();
    const { paymentId, rentalId } = settleSchema.parse(body);

    // Find payment record
    const payment = await prisma.payment.findUnique({
      where: { paymentId },
      include: { rental: true },
    });

    if (!payment) {
      throw new NotFoundError('Payment not found');
    }

    // Verify ownership
    if (payment.userId !== user.userId && user.role !== 'ADMIN') {
      throw new Error('Unauthorized');
    }

    const provider = getBillingProvider();
    const settlement = await provider.settlePayment({
      paymentId,
      amount: payment.amount,
      currency: payment.currency,
    });

    // Update payment status
    await prisma.payment.update({
      where: { id: payment.id },
      data: {
        status: 'SETTLED',
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

    return successResponse({ settlement });
  } catch (error) {
    return errorResponse(error);
  }
}

