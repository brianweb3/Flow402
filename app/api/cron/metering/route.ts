// Cron endpoint for usage metering
// In production, this would be called by a cron service (e.g., Vercel Cron, GitHub Actions)
// For MVP, this can be called manually or set up with a simple scheduler

import { checkExpiredRentals } from '@/lib/jobs/metering';
import { successResponse, errorResponse } from '@/lib/utils/api-response';

export async function POST(request: Request) {
  try {
    // Verify cron secret (in production, use a secure secret)
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return new Response('Unauthorized', { status: 401 });
    }

    const expiredCount = await checkExpiredRentals();

    return successResponse({
      message: 'Metering job completed',
      expiredRentals: expiredCount,
    });
  } catch (error) {
    return errorResponse(error);
  }
}

