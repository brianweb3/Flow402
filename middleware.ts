import { Address } from 'viem';
import { paymentMiddleware, Resource, Network } from 'x402-next';
import { NextRequest } from 'next/server';

// Получаем конфигурацию из переменных окружения
const walletAddress = (process.env.NEXT_PUBLIC_WALLET_ADDRESS || 
  process.env.SOLANA_WALLET_ADDRESS || 
  'CmGgLQL36Y9ubtTsy2zmE46TAxwCBm66onZmPPhUWNqv') as Address;

const network = (process.env.NEXT_PUBLIC_NETWORK || 'solana-devnet') as Network;
const facilitatorUrl = (process.env.NEXT_PUBLIC_FACILITATOR_URL || 
  'https://x402.org/facilitator') as Resource;
const cdpClientKey = process.env.NEXT_PUBLIC_CDP_CLIENT_KEY || 
  process.env.CDP_CLIENT_KEY || 
  '';

// Конфигурация защищенных маршрутов с ценами
const protectedRoutes: Record<string, {
  price: string;
  config: {
    description: string;
  };
  network: Network;
}> = {
  '/api/rentals': {
    price: '$0.01', // Минимальная цена, реальная цена будет вычисляться динамически
    config: {
      description: 'Rental payment for compute resources',
    },
    network,
  },
  // Можно добавить другие защищенные маршруты
  // '/premium/content': {
  //   price: '$1.00',
  //   config: {
  //     description: 'Premium content access',
  //   },
  //   network,
  // },
};

// Создаем middleware только если есть CDP ключ, иначе пропускаем
let x402PaymentMiddleware: ((request: NextRequest) => any) | null = null;

if (cdpClientKey && walletAddress) {
  try {
    x402PaymentMiddleware = paymentMiddleware(
      walletAddress,
      protectedRoutes,
      {
        url: facilitatorUrl,
      },
      {
        cdpClientKey,
        appLogo: '/logo.png', // Добавьте свой логотип
        appName: 'Flow / RAMarket',
        sessionTokenEndpoint: '/api/x402/session-token',
      },
    ) as unknown as (request: NextRequest) => any;
  } catch (error) {
    console.error('Failed to initialize X402 middleware:', error);
  }
}

export const middleware = (req: NextRequest) => {
  // Пропускаем статические файлы и внутренние маршруты Next.js
  const pathname = req.nextUrl.pathname;
  
  // Пропускаем все внутренние маршруты Next.js
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') || // Пропускаем все API routes - они обрабатывают платежи сами
    pathname.startsWith('/favicon.ico') ||
    pathname.startsWith('/static') ||
    pathname.match(/\.(svg|png|jpg|jpeg|gif|webp|ico)$/i)
  ) {
    return;
  }

  // Применяем X402 middleware только для публичных страниц, если он настроен
  // API routes обрабатывают платежи через HTTP 402 сами
  if (x402PaymentMiddleware) {
    try {
      return x402PaymentMiddleware(req);
    } catch (error) {
      console.error('X402 middleware error:', error);
      // Продолжаем выполнение даже при ошибке
      return;
    }
  }

  // Если middleware не настроен, пропускаем запрос
  return;
};

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
};

