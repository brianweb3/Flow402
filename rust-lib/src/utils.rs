// Utility functions for payment processing and validation

use serde::{Deserialize, Serialize};
use wasm_bindgen::prelude::*;

/// Validate payment amount
#[wasm_bindgen]
pub fn validate_payment_amount(amount: f64, min: f64, max: f64) -> bool {
    amount >= min && amount <= max && amount.is_finite() && amount > 0.0
}

/// Format currency amount with precision
#[wasm_bindgen]
pub fn format_currency_amount(amount: f64, decimals: u8) -> String {
    format!("{:.1$}", amount, decimals as usize)
}

/// Calculate fee from amount and percentage
#[wasm_bindgen]
pub fn calculate_fee(amount: f64, fee_percent: f64) -> f64 {
    if fee_percent < 0.0 || fee_percent > 100.0 {
        return 0.0;
    }
    amount * (fee_percent / 100.0)
}

/// Calculate total with fee
#[wasm_bindgen]
pub fn calculate_total_with_fee(amount: f64, fee_percent: f64) -> f64 {
    amount + calculate_fee(amount, fee_percent)
}

/// Validate ISO 8601 timestamp format (basic check)
#[wasm_bindgen]
pub fn validate_iso_timestamp(timestamp: &str) -> bool {
    // Basic validation: check if it contains date and time components
    timestamp.contains('T') && timestamp.len() >= 19
}

/// Check if timestamp is expired
#[wasm_bindgen]
pub fn is_timestamp_expired(timestamp: &str, current_time: &str) -> bool {
    // Simple string comparison for ISO 8601 timestamps
    timestamp < current_time
}

/// Generate quote ID
#[wasm_bindgen]
pub fn generate_quote_id() -> String {
    #[cfg(target_arch = "wasm32")]
    {
        use js_sys::Date;
        let timestamp = Date::now() as u64;
        format!("quote_{}_{}", timestamp, (timestamp % 10000))
    }
    
    #[cfg(not(target_arch = "wasm32"))]
    {
        use std::time::{SystemTime, UNIX_EPOCH};
        let timestamp = SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .unwrap()
            .as_secs();
        format!("quote_{}_{}", timestamp, (timestamp % 10000))
    }
}

/// Validate resource type
#[wasm_bindgen]
pub fn validate_resource_type(resource_type: &str) -> bool {
    resource_type == "RAM" || resource_type == "GPU"
}

/// Validate duration (must be positive)
#[wasm_bindgen]
pub fn validate_duration_minutes(duration: f64) -> bool {
    duration > 0.0 && duration.is_finite() && duration <= 525600.0 // Max 1 year
}

/// Validate price (must be positive)
#[wasm_bindgen]
pub fn validate_price(price: f64) -> bool {
    price > 0.0 && price.is_finite()
}

/// Calculate utilization percentage
#[wasm_bindgen]
pub fn calculate_utilization(used: f64, total: f64) -> f64 {
    if total <= 0.0 {
        return 0.0;
    }
    let utilization = (used / total) * 100.0;
    utilization.min(100.0).max(0.0)
}

/// Round to specified decimal places
#[wasm_bindgen]
pub fn round_to_decimals(value: f64, decimals: u8) -> f64 {
    let multiplier = 10_f64.powi(decimals as i32);
    (value * multiplier).round() / multiplier
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_validate_payment_amount() {
        assert!(validate_payment_amount(10.0, 1.0, 100.0));
        assert!(!validate_payment_amount(0.0, 1.0, 100.0));
        assert!(!validate_payment_amount(101.0, 1.0, 100.0));
    }

    #[test]
    fn test_calculate_fee() {
        assert_eq!(calculate_fee(100.0, 5.0), 5.0);
        assert_eq!(calculate_fee(100.0, 0.0), 0.0);
    }

    #[test]
    fn test_calculate_total_with_fee() {
        assert_eq!(calculate_total_with_fee(100.0, 5.0), 105.0);
    }

    #[test]
    fn test_validate_resource_type() {
        assert!(validate_resource_type("RAM"));
        assert!(validate_resource_type("GPU"));
        assert!(!validate_resource_type("CPU"));
    }

    #[test]
    fn test_calculate_utilization() {
        assert_eq!(calculate_utilization(50.0, 100.0), 50.0);
        assert_eq!(calculate_utilization(0.0, 100.0), 0.0);
        assert_eq!(calculate_utilization(150.0, 100.0), 100.0); // Capped at 100%
    }

    #[test]
    fn test_round_to_decimals() {
        assert_eq!(round_to_decimals(3.14159, 2), 3.14);
        assert_eq!(round_to_decimals(3.14159, 4), 3.1416);
    }
}

