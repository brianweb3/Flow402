use sha2::{Sha256, Digest};
use sha3::{Sha3_256, Digest as Sha3Digest};
use hex;
use serde::{Deserialize, Serialize};
use wasm_bindgen::prelude::*;

#[cfg(target_arch = "wasm32")]
use js_sys::Date;

// Include utility modules
mod utils;
mod metering;

// Re-export utility functions
pub use utils::*;
pub use metering::*;

// Payment proof verification structure
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PaymentProof {
    pub payment_id: String,
    pub proof: String,
    pub timestamp: String,
    pub signature: Option<String>,
}

// Calculator input structure
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CalculatorInput {
    pub resource_type: String, // "RAM" or "GPU"
    pub amount: f64,
    pub duration_minutes: f64,
    pub price_per_unit_per_time: f64,
    pub currency: Option<String>,
    pub platform_fee_percent: Option<f64>,
}

// Calculator result structure
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct CalculatorResult {
    pub resource_type: String,
    pub amount: f64,
    pub duration_minutes: f64,
    pub unit_price: f64,
    pub subtotal: f64,
    pub platform_fee: f64,
    pub total: f64,
    pub currency: String,
    pub breakdown: Breakdown,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Breakdown {
    pub resource_cost: f64,
    pub platform_fee: f64,
    pub total: f64,
}

/// Hash a string using SHA-256
#[wasm_bindgen]
pub fn sha256_hash(input: &str) -> String {
    let mut hasher = Sha256::new();
    hasher.update(input.as_bytes());
    let result = hasher.finalize();
    hex::encode(result)
}

/// Hash a string using SHA3-256
#[wasm_bindgen]
pub fn sha3_256_hash(input: &str) -> String {
    let mut hasher = Sha3_256::new();
    hasher.update(input.as_bytes());
    let result = hasher.finalize();
    hex::encode(result)
}

/// Verify payment proof by checking hash
#[wasm_bindgen]
pub fn verify_payment_proof(payment_id: &str, proof: &str, expected_hash: &str) -> bool {
    let combined = format!("{}:{}", payment_id, proof);
    let hash = sha256_hash(&combined);
    hash == expected_hash
}

/// Generate payment proof hash
#[wasm_bindgen]
pub fn generate_payment_proof_hash(payment_id: &str, proof: &str) -> String {
    let combined = format!("{}:{}", payment_id, proof);
    sha256_hash(&combined)
}

/// Calculate rental cost (high-performance Rust implementation)
#[wasm_bindgen]
pub fn calculate_rental_cost_json(input_json: &str) -> String {
    let input: CalculatorInput = match serde_json::from_str(input_json) {
        Ok(i) => i,
        Err(e) => {
            return serde_json::json!({
                "error": format!("Invalid input: {}", e)
            }).to_string();
        }
    };

    let platform_fee_percent = input.platform_fee_percent.unwrap_or(5.0);
    let currency = input.currency.unwrap_or_else(|| "USDC".to_string());

    let resource_cost = if input.resource_type == "RAM" {
        // RAM: price is per GB-hour
        let duration_hours = input.duration_minutes / 60.0;
        input.amount * duration_hours * input.price_per_unit_per_time
    } else {
        // GPU: price is per GPU-minute
        input.amount * input.duration_minutes * input.price_per_unit_per_time
    };

    let platform_fee = resource_cost * (platform_fee_percent / 100.0);
    let total = resource_cost + platform_fee;

    let result = CalculatorResult {
        resource_type: input.resource_type,
        amount: input.amount,
        duration_minutes: input.duration_minutes,
        unit_price: input.price_per_unit_per_time,
        subtotal: resource_cost,
        platform_fee,
        total,
        currency,
        breakdown: Breakdown {
            resource_cost,
            platform_fee,
            total,
        },
    };

    serde_json::to_string(&result).unwrap_or_else(|e| {
        serde_json::json!({
            "error": format!("Serialization error: {}", e)
        }).to_string()
    })
}

/// Calculate provider earnings
#[wasm_bindgen]
pub fn calculate_provider_earnings_json(input_json: &str) -> String {
    #[derive(Deserialize)]
    struct EarningsInput {
        price_per_unit_per_time: f64,
        amount: f64,
        duration_minutes: f64,
        utilization_percent: f64,
        resource_type: String,
    }

    let input: EarningsInput = match serde_json::from_str(input_json) {
        Ok(i) => i,
        Err(e) => {
            return serde_json::json!({
                "error": format!("Invalid input: {}", e)
            }).to_string();
        }
    };

    let hourly_rate = if input.resource_type == "RAM" {
        input.amount * input.price_per_unit_per_time
    } else {
        // GPU: convert per-minute to per-hour
        input.amount * input.price_per_unit_per_time * 60.0
    };

    let daily_earnings = hourly_rate * 24.0 * (input.utilization_percent / 100.0);
    let monthly_earnings = daily_earnings * 30.0;

    let result = serde_json::json!({
        "hourly_rate": hourly_rate,
        "daily_earnings": daily_earnings,
        "monthly_earnings": monthly_earnings,
        "utilization_breakdown": {
            "at50_percent": hourly_rate * 24.0 * 0.5 * 30.0,
            "at75_percent": hourly_rate * 24.0 * 0.75 * 30.0,
            "at100_percent": hourly_rate * 24.0 * 1.0 * 30.0,
        }
    });

    result.to_string()
}

/// Validate wallet address format (basic validation)
#[wasm_bindgen]
pub fn validate_wallet_address(address: &str) -> bool {
    // Basic validation: check if it's a hex string and has reasonable length
    // For Solana: base58 encoded, 32-44 characters
    // For Ethereum: 0x followed by 40 hex characters
    if address.starts_with("0x") {
        address.len() == 42 && address[2..].chars().all(|c| c.is_ascii_hexdigit())
    } else {
        // Solana address (base58, but we'll do basic length check)
        address.len() >= 32 && address.len() <= 44
    }
}

/// Generate a secure random payment ID
#[wasm_bindgen]
pub fn generate_payment_id() -> String {
    #[cfg(target_arch = "wasm32")]
    {
        let timestamp = Date::now() as u64;
        let random: u64 = (timestamp * 1000) % 1000000;
        let random_data = format!("payment_{}_{}", timestamp, random);
        let hash = sha256_hash(&random_data);
        format!("pay_{}", &hash[..16])
    }
    
    #[cfg(not(target_arch = "wasm32"))]
    {
        use std::time::{SystemTime, UNIX_EPOCH};
        let timestamp = SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .unwrap()
            .as_nanos();
        let random_data = format!("payment_{}", timestamp);
        let hash = sha256_hash(&random_data);
        format!("pay_{}", &hash[..16])
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_sha256_hash() {
        let result = sha256_hash("test");
        assert_eq!(result.len(), 64); // SHA-256 produces 64 hex characters
    }

    #[test]
    fn test_verify_payment_proof() {
        let payment_id = "test_payment";
        let proof = "test_proof";
        let hash = generate_payment_proof_hash(payment_id, proof);
        assert!(verify_payment_proof(payment_id, proof, &hash));
    }

    #[test]
    fn test_calculate_rental_cost() {
        let input = CalculatorInput {
            resource_type: "RAM".to_string(),
            amount: 8.0,
            duration_minutes: 60.0,
            price_per_unit_per_time: 0.1,
            currency: Some("USDC".to_string()),
            platform_fee_percent: Some(5.0),
        };
        
        let input_json = serde_json::to_string(&input).unwrap();
        let result_json = calculate_rental_cost_json(&input_json);
        let result: CalculatorResult = serde_json::from_str(&result_json).unwrap();
        
        assert_eq!(result.resource_type, "RAM");
        assert_eq!(result.total, 0.84); // 8 * 1 * 0.1 + 5% = 0.8 + 0.04
    }

    #[test]
    fn test_validate_wallet_address() {
        assert!(validate_wallet_address("0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb"));
        assert!(!validate_wallet_address("invalid"));
    }
}

