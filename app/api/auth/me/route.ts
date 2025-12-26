import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { requireAuth } from '@/lib/auth/middleware';
import { successResponse, errorResponse } from '@/lib/utils/api-response';

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth(request);

    const dbUser = await prisma.user.findUnique({
      where: { id: user.userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        walletAddress: true,
        payoutAddress: true,
        kycVerified: true,
        image: true,
        createdAt: true,
      },
    });

    if (!dbUser) {
      throw new Error('User not found');
    }

    return successResponse({ user: dbUser });
  } catch (error) {
    return errorResponse(error);
  }
}

