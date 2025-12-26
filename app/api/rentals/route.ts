import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { requireAuth } from '@/lib/auth/middleware';
import { createRentalSchema } from '@/lib/utils/validation';
import { calculateRentalCost } from '@/lib/payments/calculator';
import { getBillingProvider } from '@/lib/payments/x402/mock';
import { successResponse, errorResponse } from '@/lib/utils/api-response';
import { NotFoundError, PaymentError } from '@/lib/utils/errors';
import { randomBytes } from 'crypto';

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth(request);
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');

    const where: any = { userId: user.userId };
    if (status) {
      where.status = status;
    }

    const rentals = await prisma.rental.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        offer: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        },
        invoice: true,
      },
    });

    return successResponse({ rentals });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth(request);
    const body = await request.json();
    const validated = createRentalSchema.parse(body);

    // Find offer
    const offer = await prisma.offer.findUnique({
      where: { id: validated.offerId },
      include: { user: true },
    });

    if (!offer || !offer.published || !offer.active) {
      throw new NotFoundError('Offer not found or not available');
    }

    // Prevent self-rental
    if (offer.userId === user.userId) {
      throw new Error('Cannot rent your own offer');
    }

    // Calculate cost
    const cost = calculateRentalCost({
      resourceType: offer.resourceType,
      amount: validated.amount,
      durationMinutes: validated.durationMinutes,
      pricePerUnitPerTime: offer.pricePerUnitPerTime,
      currency: offer.currency,
    });

    // Determine start/end times
    const startTime = validated.startNow ? new Date() : null;
    const endTime = startTime
      ? new Date(startTime.getTime() + validated.durationMinutes * 60 * 1000)
      : null;

    // Create rental (pending payment)
    const rental = await prisma.rental.create({
      data: {
        offerId: validated.offerId,
        userId: user.userId,
        resourceType: offer.resourceType,
        amount: validated.amount,
        durationMinutes: validated.durationMinutes,
        startTime,
        endTime,
        status: startTime ? 'ACTIVE' : 'PENDING',
        unitPrice: offer.pricePerUnitPerTime,
        totalPrice: cost.total,
        platformFee: cost.platformFee,
        currency: cost.currency,
        accessToken: startTime ? `token_${randomBytes(32).toString('hex')}` : null,
        accessUrl: startTime ? `https://api.flow-ramarket.com/access/${validated.offerId}` : null,
      },
      include: {
        offer: true,
      },
    });

    // Create payment challenge (HTTP 402)
    const provider = getBillingProvider();
    const paymentRequest = await provider.createPaymentChallenge({
      amount: cost.total,
      currency: cost.currency,
      description: `Rental payment for ${validated.amount} ${offer.resourceType} for ${validated.durationMinutes} minutes`,
      metadata: {
        rentalId: rental.id,
        offerId: validated.offerId,
      },
    });

    // Create payment record
    await prisma.payment.create({
      data: {
        rentalId: rental.id,
        userId: user.userId,
        paymentId: paymentRequest.challenge.paymentId,
        amount: cost.total,
        currency: cost.currency,
        status: 'PENDING',
        challenge: JSON.stringify(paymentRequest.challenge),
      },
    });

    // Create invoice
    await prisma.invoice.create({
      data: {
        rentalId: rental.id,
        userId: user.userId,
        providerId: offer.userId,
        subtotal: cost.subtotal,
        platformFee: cost.platformFee,
        total: cost.total,
        currency: cost.currency,
        status: 'PENDING',
      },
    });

    // Return HTTP 402 with payment challenge
    return new Response(
      JSON.stringify({
        success: false,
        error: {
          message: 'Payment required',
          code: 'PAYMENT_REQUIRED',
        },
        payment: paymentRequest,
        rental: {
          id: rental.id,
          status: rental.status,
        },
      }),
      {
        status: 402,
        headers: {
          'Content-Type': 'application/json',
          'X-402-Payment-Required': 'true',
          'X-402-Payment-Id': paymentRequest.challenge.paymentId,
        },
      }
    );
  } catch (error) {
    return errorResponse(error);
  }
}

