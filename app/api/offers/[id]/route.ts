import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { requireAuth, requireOwner } from '@/lib/auth/middleware';
import { updateOfferSchema } from '@/lib/utils/validation';
import { successResponse, errorResponse } from '@/lib/utils/api-response';
import { NotFoundError } from '@/lib/utils/errors';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const offer = await prisma.offer.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        node: {
          select: {
            id: true,
            name: true,
            region: true,
            status: true,
          },
        },
        _count: {
          select: {
            rentals: true,
          },
        },
      },
    });

    if (!offer) {
      throw new NotFoundError('Offer not found');
    }

    return successResponse({ offer });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth(request);
    const { id } = await params;
    const body = await request.json();
    const validated = updateOfferSchema.parse(body);

    const offer = await prisma.offer.findUnique({
      where: { id },
    });

    if (!offer) {
      throw new NotFoundError('Offer not found');
    }

    requireOwner(user, offer.userId);

    const updated = await prisma.offer.update({
      where: { id },
      data: validated,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        node: true,
      },
    });

    return successResponse({ offer: updated });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth(request);
    const { id } = await params;

    const offer = await prisma.offer.findUnique({
      where: { id },
    });

    if (!offer) {
      throw new NotFoundError('Offer not found');
    }

    requireOwner(user, offer.userId);

    await prisma.offer.update({
      where: { id },
      data: { active: false },
    });

    return successResponse({ message: 'Offer deleted successfully' });
  } catch (error) {
    return errorResponse(error);
  }
}

