import { clearAuthCookies } from '@/lib/auth/jwt';
import { successResponse } from '@/lib/utils/api-response';

export async function POST() {
  await clearAuthCookies();
  return successResponse({ message: 'Logged out successfully' });
}

