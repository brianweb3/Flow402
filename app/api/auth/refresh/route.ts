import { NextRequest } from 'next/server';
import { getRefreshToken, verifyRefreshToken, signAccessToken, setAuthCookies } from '@/lib/auth/jwt';
import { prisma } from '@/lib/db/prisma';
import { successResponse, errorResponse } from '@/lib/utils/api-response';
import { AuthenticationError } from '@/lib/utils/errors';

export async function POST(request: NextRequest) {
  try {
    const refreshToken = await getRefreshToken();
    
    if (!refreshToken) {
      throw new AuthenticationError('Refresh token not found');
    }

    const payload = verifyRefreshToken(refreshToken);

    // Verify user still exists
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
    });

    if (!user) {
      throw new AuthenticationError('User not found');
    }

    // Generate new access token
    const accessToken = signAccessToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    });

    // Set new access token cookie (refresh token stays the same)
    const cookieStore = await request.cookies;
    await setAuthCookies(accessToken, refreshToken);

    return successResponse({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });
  } catch (error) {
    return errorResponse(error);
  }
}

