import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { requireAuth } from '@/lib/auth/middleware';
import { createOfferSchema } from '@/lib/utils/validation';
import { successResponse, errorResponse } from '@/lib/utils/api-response';
import { z } from 'zod';

const querySchema = z.object({
  resourceType: z.enum(['RAM', 'GPU']).optional(),
  region: z.string().optional(),
  minPrice: z.string().optional(),
  maxPrice: z.string().optional(),
  sortBy: z.enum(['price', 'reliability', 'createdAt']).optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
  page: z.string().optional(),
  limit: z.string().optional(),
});

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const params = querySchema.parse({
      resourceType: searchParams.get('resourceType'),
      region: searchParams.get('region'),
      minPrice: searchParams.get('minPrice'),
      maxPrice: searchParams.get('maxPrice'),
      sortBy: searchParams.get('sortBy') || 'price',
      sortOrder: searchParams.get('sortOrder') || 'asc',
      page: searchParams.get('page') || '1',
      limit: searchParams.get('limit') || '20',
    });

    const page = parseInt(params.page || '1');
    const limit = parseInt(params.limit || '20');
    const skip = (page - 1) * limit;

    const where: any = {
      published: true,
      active: true,
    };

    if (params.resourceType) {
      where.resourceType = params.resourceType;
    }

    if (params.region) {
      where.region = params.region;
    }

    if (params.minPrice || params.maxPrice) {
      where.pricePerUnitPerTime = {};
      if (params.minPrice) {
        where.pricePerUnitPerTime.gte = parseFloat(params.minPrice);
      }
      if (params.maxPrice) {
        where.pricePerUnitPerTime.lte = parseFloat(params.maxPrice);
      }
    }

    const orderBy: any = {};
    if (params.sortBy === 'price') {
      orderBy.pricePerUnitPerTime = params.sortOrder || 'asc';
    } else if (params.sortBy === 'reliability') {
      orderBy.reliabilityScore = params.sortOrder || 'desc';
    } else {
      orderBy.createdAt = params.sortOrder || 'desc';
    }

    const [offers, total] = await Promise.all([
      prisma.offer.findMany({
        where,
        orderBy,
        skip,
        take: limit,
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
      }),
      prisma.offer.count({ where }),
    ]);

    return successResponse({
      offers,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireAuth(request);
    const body = await request.json();
    const validated = createOfferSchema.parse(body);

    // Verify user is a provider
    if (user.role !== 'PROVIDER' && user.role !== 'ADMIN') {
      throw new Error('Only providers can create offers');
    }

    // If nodeId provided, verify ownership
    if (validated.nodeId) {
      const node = await prisma.node.findFirst({
        where: {
          id: validated.nodeId,
          userId: user.userId,
        },
      });

      if (!node) {
        throw new Error('Node not found or access denied');
      }
    }

    const offer = await prisma.offer.create({
      data: {
        ...validated,
        userId: user.userId,
      },
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

    return successResponse({ offer }, 201);
  } catch (error) {
    return errorResponse(error);
  }
}

