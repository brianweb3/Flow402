# Настройка Solana X402 протокола оплаты

## Обзор

Этот проект интегрирован с протоколом X402 для обработки платежей через Solana blockchain. X402 использует HTTP статус код 402 (Payment Required) для запроса платежей.

## Установка зависимостей

Зависимости уже установлены:
- `x402-next` - Next.js middleware для X402
- `viem` - Type-safe библиотека для работы с блокчейном

## Настройка переменных окружения

Создайте файл `.env.local` в корне проекта со следующими переменными:

```bash
# Solana X402 Payment Configuration
# Ваш Solana адрес кошелька (куда будут поступать платежи)
NEXT_PUBLIC_WALLET_ADDRESS="CmGgLQL36Y9ubtTsy2zmE46TAxwCBm66onZmPPhUWNqv"

# Сеть: solana-devnet (для тестирования) или solana-mainnet-beta (для продакшена)
NEXT_PUBLIC_NETWORK="solana-devnet"

# Coinbase Developer Platform Client Key
# Получите ваш API ключ на: https://portal.cdp.coinbase.com/
NEXT_PUBLIC_CDP_CLIENT_KEY="your_client_key_here"

# X402 Facilitator URL (по умолчанию: https://x402.org/facilitator)
NEXT_PUBLIC_FACILITATOR_URL="https://x402.org/facilitator"

# Провайдер платежей (auto - автоматический выбор, mock - мок, solana - Solana)
NEXT_PUBLIC_X402_PROVIDER="auto"
```

## Получение Coinbase CDP Client Key

1. Перейдите на https://portal.cdp.coinbase.com/
2. Создайте аккаунт или войдите
3. Создайте новое приложение
4. Получите Client Key из настроек приложения
5. Добавьте его в `.env.local` как `NEXT_PUBLIC_CDP_CLIENT_KEY`

## Как это работает

### Архитектура

1. **Middleware** (`middleware.ts`) - перехватывает запросы и применяет X402 логику
2. **API Endpoints** - существующие `/api/rentals` и `/api/payments/*` обрабатывают платежи
3. **Session Token** (`/api/x402/session-token`) - создает сессию после успешной оплаты
4. **Провайдеры** - автоматическое переключение между mock и Solana провайдером

### Поток оплаты

1. Пользователь создает rental через `POST /api/rentals`
2. Сервер возвращает HTTP 402 с payment challenge
3. Клиент показывает Coinbase Pay виджет
4. Пользователь оплачивает через Coinbase Pay
5. Платеж верифицируется на Solana blockchain через facilitator
6. Создается session token
7. Rental активируется

## Режимы работы

### Auto режим (по умолчанию)

Если установлен `NEXT_PUBLIC_X402_PROVIDER="auto"` (или не установлен), система автоматически:
- Использует Solana X402, если настроены `NEXT_PUBLIC_WALLET_ADDRESS` и `NEXT_PUBLIC_CDP_CLIENT_KEY`
- Иначе использует mock провайдер

### Mock режим

Для разработки без реальных платежей:
```bash
NEXT_PUBLIC_X402_PROVIDER="mock"
```

### Solana режим

Принудительное использование Solana:
```bash
NEXT_PUBLIC_X402_PROVIDER="solana"
NEXT_PUBLIC_WALLET_ADDRESS="your_wallet_address"
NEXT_PUBLIC_CDP_CLIENT_KEY="your_client_key"
```

## Тестирование

### Devnet (для тестирования)

```bash
NEXT_PUBLIC_NETWORK="solana-devnet"
```

- Использует тестовые токены
- Не требует реальных денег
- Получите тестовые токены на: https://faucet.solana.com/

### Mainnet (для продакшена)

```bash
NEXT_PUBLIC_NETWORK="solana-mainnet-beta"
```

⚠️ **ВНИМАНИЕ**: Используйте mainnet только после тщательного тестирования!

## Защищенные маршруты

Middleware автоматически защищает маршруты, определенные в `protectedRoutes`:

- `/api/rentals` - создание аренды (цена динамическая)

Вы можете добавить больше защищенных маршрутов в `middleware.ts`:

```typescript
const protectedRoutes = {
  '/api/rentals': { ... },
  '/premium/content': {
    price: '$1.00',
    config: {
      description: 'Premium content access',
    },
    network,
  },
};
```

## Интеграция с существующим кодом

Существующие API routes (`/api/rentals`, `/api/payments/*`) продолжают работать и автоматически используют настроенный провайдер:

- `getBillingProvider()` - возвращает текущий провайдер (mock или Solana)
- Автоматическое переключение между провайдерами
- Обратная совместимость с mock провайдером

## Отладка

Если платежи не работают:

1. Проверьте консоль браузера на ошибки
2. Проверьте переменные окружения
3. Убедитесь, что CDP Client Key валиден
4. Проверьте, что wallet address корректный
5. Для devnet убедитесь, что используете тестовые токены

## Дополнительные ресурсы

- [X402 Specification](https://x402.org)
- [Solana Documentation](https://docs.solana.com)
- [Coinbase Developer Platform](https://portal.cdp.coinbase.com/)
- [X402 Next Package](https://github.com/x402-org/x402-next)

