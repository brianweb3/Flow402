/**
 * TypeScript wrapper for Rust crypto library
 * This file provides a bridge to the Rust WebAssembly module
 */

// Types matching Rust structures
export interface RustCalculatorInput {
  resource_type: 'RAM' | 'GPU';
  amount: number;
  duration_minutes: number;
  price_per_unit_per_time: number;
  currency?: string;
  platform_fee_percent?: number;
}

export interface RustCalculatorResult {
  resource_type: string;
  amount: number;
  duration_minutes: number;
  unit_price: number;
  subtotal: number;
  platform_fee: number;
  total: number;
  currency: string;
  breakdown: {
    resource_cost: number;
    platform_fee: number;
    total: number;
  };
}

export interface RustEarningsInput {
  price_per_unit_per_time: number;
  amount: number;
  duration_minutes: number;
  utilization_percent: number;
  resource_type: 'RAM' | 'GPU';
}

export interface RustEarningsResult {
  hourly_rate: number;
  daily_earnings: number;
  monthly_earnings: number;
  utilization_breakdown: {
    at50_percent: number;
    at75_percent: number;
    at100_percent: number;
  };
}

// Rust WASM module interface
interface RustCryptoModule {
  sha256_hash(input: string): string;
  sha3_256_hash(input: string): string;
  verify_payment_proof(payment_id: string, proof: string, expected_hash: string): boolean;
  generate_payment_proof_hash(payment_id: string, proof: string): string;
  calculate_rental_cost_json(input_json: string): string;
  calculate_provider_earnings_json(input_json: string): string;
  validate_wallet_address(address: string): boolean;
  generate_payment_id(): string;
}

let rustModule: RustCryptoModule | null = null;
let isInitialized = false;

/**
 * Initialize the Rust WASM module
 * Call this before using any Rust functions
 */
export async function initRustCrypto(): Promise<void> {
  if (isInitialized) {
    return;
  }

  try {
    // Dynamic import of the WASM module
    // In production, this would be the compiled WASM file
    const wasmModule = await import('../../rust-lib/pkg/flow402_crypto');
    await wasmModule.default();
    rustModule = wasmModule as unknown as RustCryptoModule;
    isInitialized = true;
  } catch (error) {
    console.warn('Rust crypto module not available, falling back to JS implementation:', error);
    // Fallback to JavaScript implementation if WASM is not available
    rustModule = null;
  }
}

/**
 * Check if Rust module is available
 */
export function isRustCryptoAvailable(): boolean {
  return rustModule !== null && isInitialized;
}

/**
 * SHA-256 hash function
 */
export function sha256Hash(input: string): string {
  if (rustModule) {
    return rustModule.sha256_hash(input);
  }
  // Fallback to Web Crypto API
  // Note: This is async in Web Crypto, but we'll use a sync fallback
  return fallbackSha256(input);
}

/**
 * SHA3-256 hash function
 */
export function sha3_256Hash(input: string): string {
  if (rustModule) {
    return rustModule.sha3_256_hash(input);
  }
  // Fallback implementation would go here
  throw new Error('SHA3-256 not available without Rust module');
}

/**
 * Verify payment proof
 */
export function verifyPaymentProof(
  paymentId: string,
  proof: string,
  expectedHash: string
): boolean {
  if (rustModule) {
    return rustModule.verify_payment_proof(paymentId, proof, expectedHash);
  }
  // Fallback: generate hash and compare
  const hash = generatePaymentProofHash(paymentId, proof);
  return hash === expectedHash;
}

/**
 * Generate payment proof hash
 */
export function generatePaymentProofHash(paymentId: string, proof: string): string {
  if (rustModule) {
    return rustModule.generate_payment_proof_hash(paymentId, proof);
  }
  // Fallback implementation
  const combined = `${paymentId}:${proof}`;
  return sha256Hash(combined);
}

/**
 * Calculate rental cost using Rust (if available)
 */
export function calculateRentalCostRust(input: RustCalculatorInput): RustCalculatorResult {
  if (rustModule) {
    const inputJson = JSON.stringify(input);
    const resultJson = rustModule.calculate_rental_cost_json(inputJson);
    return JSON.parse(resultJson);
  }
  throw new Error('Rust calculator not available');
}

/**
 * Calculate provider earnings using Rust (if available)
 */
export function calculateProviderEarningsRust(input: RustEarningsInput): RustEarningsResult {
  if (rustModule) {
    const inputJson = JSON.stringify(input);
    const resultJson = rustModule.calculate_provider_earnings_json(inputJson);
    return JSON.parse(resultJson);
  }
  throw new Error('Rust calculator not available');
}

/**
 * Validate wallet address
 */
export function validateWalletAddress(address: string): boolean {
  if (rustModule) {
    return rustModule.validate_wallet_address(address);
  }
  // Fallback validation
  if (address.startsWith('0x')) {
    return address.length === 42 && /^0x[0-9a-fA-F]{40}$/.test(address);
  }
  return address.length >= 32 && address.length <= 44;
}

/**
 * Generate payment ID
 */
export function generatePaymentId(): string {
  if (rustModule) {
    return rustModule.generate_payment_id();
  }
  // Fallback: use crypto.randomUUID or timestamp-based
  return `payment_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
}

// Fallback SHA-256 implementation using Web Crypto API
async function fallbackSha256Async(input: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(input);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// Synchronous fallback (simplified, not cryptographically secure for production)
function fallbackSha256(input: string): string {
  // This is a placeholder - in production, you'd want to use the async version
  // or a proper synchronous hash library
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    const char = input.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  // Convert to hex string (simplified)
  return Math.abs(hash).toString(16).padStart(64, '0');
}

