# Flow402 Crypto Library (Rust)

Высокопроизводительная Rust библиотека для криптографических операций и вычислений в проекте Flow402.

## Возможности

- **Криптография**: SHA-256, SHA3-256 (Keccak) хеширование
- **Верификация платежей**: Проверка payment proof для x402 протокола
- **Калькулятор**: Высокопроизводительные вычисления стоимости аренды
- **Валидация**: Проверка формата wallet адресов
- **WebAssembly**: Готово для компиляции в WASM для использования в браузере

## Сборка

### Обычная библиотека

```bash
cd rust-lib
cargo build --release
```

### WebAssembly

```bash
# Установить wasm-pack если еще не установлен
cargo install wasm-pack

# Собрать WASM модуль
wasm-pack build --target web
```

## Использование

### Из TypeScript/JavaScript

После компиляции в WASM:

```typescript
import init, { 
  sha256_hash, 
  calculate_rental_cost_json,
  verify_payment_proof 
} from './rust-lib/pkg/flow402_crypto';

// Инициализация
await init();

// Использование
const hash = sha256_hash("test");
const result = calculate_rental_cost_json(JSON.stringify({
  resource_type: "RAM",
  amount: 8,
  duration_minutes: 60,
  price_per_unit_per_time: 0.1
}));
```

### Из Rust

```rust
use flow402_crypto::{sha256_hash, calculate_rental_cost_json};

let hash = sha256_hash("test");
```

## API

### Криптографические функции

- `sha256_hash(input: &str) -> String` - SHA-256 хеш
- `sha3_256_hash(input: &str) -> String` - SHA3-256 хеш
- `verify_payment_proof(payment_id, proof, expected_hash) -> bool` - Верификация payment proof
- `generate_payment_proof_hash(payment_id, proof) -> String` - Генерация хеша для payment proof

### Калькулятор

- `calculate_rental_cost_json(input_json: &str) -> String` - Расчёт стоимости аренды
- `calculate_provider_earnings_json(input_json: &str) -> String` - Расчёт доходов провайдера

### Утилиты

- `validate_wallet_address(address: &str) -> bool` - Валидация wallet адреса
- `generate_payment_id() -> String` - Генерация уникального payment ID

## Тестирование

```bash
cargo test
```

## Производительность

Rust реализация калькулятора может быть в 10-100 раз быстрее JavaScript версии для больших объёмов вычислений, особенно при обработке множества запросов одновременно.

