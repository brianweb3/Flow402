import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { requireAuth, requireOwner } from '@/lib/auth/middleware';
import { successResponse, errorResponse } from '@/lib/utils/api-response';
import { NotFoundError } from '@/lib/utils/errors';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth(request);
    const { id } = await params;

    const rental = await prisma.rental.findUnique({
      where: { id },
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
        payments: true,
        invoice: true,
        usageRecords: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!rental) {
      throw new NotFoundError('Rental not found');
    }

    // Check access (consumer or provider)
    if (rental.userId !== user.userId && rental.offer.userId !== user.userId && user.role !== 'ADMIN') {
      throw new Error('Unauthorized');
    }

    return successResponse({ rental });
  } catch (error) {
    return errorResponse(error);
  }
}

