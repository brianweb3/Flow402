import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { requireAuth } from '@/lib/auth/middleware';
import { createNodeSchema } from '@/lib/utils/validation';
import { successResponse, errorResponse } from '@/lib/utils/api-response';

export async function GET(request: NextRequest) {
  try {
    const user = await requireAuth(request);

    const nodes = await prisma.node.findMany({
      where: { userId: user.userId },
      include: {
        _count: {
          select: {
            offers: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return successResponse({ nodes });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth(request);
    const body = await request.json();
    const validated = createNodeSchema.parse(body);

    // Verify user is a provider
    if (user.role !== 'PROVIDER' && user.role !== 'ADMIN') {
      throw new Error('Only providers can create nodes');
    }

    const node = await prisma.node.create({
      data: {
        ...validated,
        userId: user.userId,
        availableRamGB: validated.totalRamGB,
        availableGpuCount: validated.totalGpuCount,
      },
      include: {
        _count: {
          select: {
            offers: true,
          },
        },
      },
    });

    return successResponse({ node }, 201);
  } catch (error) {
    return errorResponse(error);
  }
}

