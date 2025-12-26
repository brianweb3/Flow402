import { NextRequest } from 'next/server';
import { requireAuth } from '@/lib/auth/middleware';
import { getBillingProvider } from '@/lib/payments/x402/mock';
import { paymentQuoteSchema } from '@/lib/utils/validation';
import { successResponse, errorResponse } from '@/lib/utils/api-response';

export async function POST(request: NextRequest) {
  try {
    await requireAuth(request);
    const body = await request.json();
    const validated = paymentQuoteSchema.parse(body);

    const provider = getBillingProvider();
    const quote = await provider.createQuote({
      amount: validated.amount,
      currency: validated.currency,
      description: `Rental payment for rental ${validated.rentalId}`,
    });

    return successResponse({ quote });
  } catch (error) {
    return errorResponse(error);
  }
}

