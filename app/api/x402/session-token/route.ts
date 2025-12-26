import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db/prisma';
import { requireAuth } from '@/lib/auth/middleware';

/**
 * API endpoint для создания session token после успешной оплаты через X402
 * Этот endpoint вызывается X402 middleware после подтверждения платежа
 */
export async function POST(request: NextRequest) {
  try {
    // Получаем информацию о пользователе (опционально, можно и без аутентификации)
    let user = null;
    try {
      user = await requireAuth(request);
    } catch {
      // Если нет аутентификации, продолжаем без нее
      // X402 работает без обязательной регистрации
    }

    const body = await request.json();
    const { paymentId, signature, transactionHash } = body;

    if (!paymentId || !signature) {
      return NextResponse.json(
        { error: 'Missing paymentId or signature' },
        { status: 400 }
      );
    }

    // Проверяем, существует ли уже payment в базе данных
    let payment = await prisma.payment.findUnique({
      where: { paymentId },
    });

    if (!payment && user) {
      // Если платеж не найден, но есть пользователь, создаем запись
      // Это может произойти, если платеж был инициирован напрямую через X402
      payment = await prisma.payment.create({
        data: {
          paymentId,
          userId: user.userId,
          amount: 0, // Сумма будет обновлена при верификации
          currency: 'USD',
          status: 'PENDING',
          challenge: JSON.stringify({ signature, transactionHash }),
        },
      });
    }

    // Генерируем session token
    // В реальном приложении здесь должна быть генерация JWT или другого токена сессии
    const sessionToken = `x402_session_${paymentId}_${Date.now()}`;

    // Сохраняем сессию (можно использовать Redis или базу данных)
    // Для простоты возвращаем токен, middleware x402-next обработает остальное

    return NextResponse.json({
      sessionToken,
      paymentId,
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 часа
    });
  } catch (error) {
    console.error('Session token creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create session token' },
      { status: 500 }
    );
  }
}

