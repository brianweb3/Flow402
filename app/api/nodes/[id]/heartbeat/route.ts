import { NextRequest } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { requireAuth, requireOwner } from '@/lib/auth/middleware';
import { successResponse, errorResponse } from '@/lib/utils/api-response';
import { NotFoundError } from '@/lib/utils/errors';
import { z } from 'zod';

const heartbeatSchema = z.object({
  status: z.enum(['ONLINE', 'OFFLINE', 'MAINTENANCE']).optional(),
  availableRamGB: z.number().optional(),
  availableGpuCount: z.number().optional(),
});

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await requireAuth(request);
    const { id } = await params;
    const body = await request.json();
    const validated = heartbeatSchema.parse(body);

    const node = await prisma.node.findUnique({
      where: { id },
    });

    if (!node) {
      throw new NotFoundError('Node not found');
    }

    requireOwner(user, node.userId);

    const updated = await prisma.node.update({
      where: { id },
      data: {
        status: validated.status || 'ONLINE',
        lastHeartbeat: new Date(),
        ...(validated.availableRamGB !== undefined && {
          availableRamGB: validated.availableRamGB,
        }),
        ...(validated.availableGpuCount !== undefined && {
          availableGpuCount: validated.availableGpuCount,
        }),
      },
    });

    return successResponse({ node: updated });
  } catch (error) {
    return errorResponse(error);
  }
}

