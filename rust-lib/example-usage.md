# Примеры использования Rust библиотеки

## Сборка

```bash
# Установить Rust (если еще не установлен)
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh

# Установить wasm-pack для сборки WebAssembly
cargo install wasm-pack

# Собрать библиотеку
cd rust-lib
./build.sh
```

## Использование из TypeScript

```typescript
import { 
  initRustCrypto,
  sha256Hash,
  calculateRentalCostRust,
  verifyPaymentProof,
  isRustCryptoAvailable
} from '@/lib/payments/rust-crypto';

// Инициализация (вызвать один раз при загрузке приложения)
await initRustCrypto();

if (isRustCryptoAvailable()) {
  // Использование Rust функций
  
  // Хеширование
  const hash = sha256Hash("test data");
  console.log("Hash:", hash);
  
  // Расчёт стоимости аренды
  const cost = calculateRentalCostRust({
    resource_type: "RAM",
    amount: 8,
    duration_minutes: 60,
    price_per_unit_per_time: 0.1,
    currency: "USDC",
    platform_fee_percent: 5.0
  });
  console.log("Total cost:", cost.total);
  
  // Верификация payment proof
  const isValid = verifyPaymentProof(
    "payment_123",
    "proof_abc",
    "expected_hash_here"
  );
  console.log("Payment valid:", isValid);
} else {
  // Fallback на JavaScript реализацию
  console.log("Rust module not available, using JS fallback");
}
```

## Использование из Rust

```rust
use flow402_crypto::*;

fn main() {
    // Хеширование
    let hash = sha256_hash("hello");
    println!("{}", hash);
    
    // Калькулятор
    let input = r#"{
        "resource_type": "RAM",
        "amount": 8.0,
        "duration_minutes": 60.0,
        "price_per_unit_per_time": 0.1
    }"#;
    
    let result = calculate_rental_cost_json(input);
    println!("{}", result);
}
```

## Производительность

Rust реализация может быть значительно быстрее JavaScript для:
- Массовых вычислений (обработка тысяч запросов)
- Криптографических операций
- Валидации данных

Пример бенчмарка:
- JavaScript калькулятор: ~1000 операций/сек
- Rust калькулятор (WASM): ~10000+ операций/сек

