// Metering and usage tracking functions

use serde::{Deserialize, Serialize};
use wasm_bindgen::prelude::*;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct UsageRecord {
    pub rental_id: String,
    pub start_time: String,
    pub end_time: String,
    pub duration_seconds: u64,
    pub amount: f64,
    pub cost: f64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MeteringInput {
    pub rental_id: String,
    pub start_time: String,
    pub end_time: String,
    pub resource_type: String,
    pub amount: f64,
    pub price_per_unit_per_time: f64,
}

/// Calculate usage cost from metering data
#[wasm_bindgen]
pub fn calculate_usage_cost_json(input_json: &str) -> String {
    let input: MeteringInput = match serde_json::from_str(input_json) {
        Ok(i) => i,
        Err(e) => {
            return serde_json::json!({
                "error": format!("Invalid input: {}", e)
            }).to_string();
        }
    };

    // Parse timestamps and calculate duration
    let start = parse_timestamp(&input.start_time);
    let end = parse_timestamp(&input.end_time);
    
    let duration_seconds = if end > start {
        (end - start) as u64
    } else {
        0
    };

    // Calculate cost based on resource type
    let cost = if input.resource_type == "RAM" {
        // RAM: price is per GB-hour
        let duration_hours = duration_seconds as f64 / 3600.0;
        input.amount * duration_hours * input.price_per_unit_per_time
    } else {
        // GPU: price is per GPU-minute
        let duration_minutes = duration_seconds as f64 / 60.0;
        input.amount * duration_minutes * input.price_per_unit_per_time
    };

    let record = UsageRecord {
        rental_id: input.rental_id,
        start_time: input.start_time,
        end_time: input.end_time,
        duration_seconds,
        amount: input.amount,
        cost,
    };

    serde_json::to_string(&record).unwrap_or_else(|e| {
        serde_json::json!({
            "error": format!("Serialization error: {}", e)
        }).to_string()
    })
}

/// Calculate total cost from multiple usage records
#[wasm_bindgen]
pub fn calculate_total_usage_cost_json(records_json: &str) -> String {
    let records: Vec<UsageRecord> = match serde_json::from_str(records_json) {
        Ok(r) => r,
        Err(e) => {
            return serde_json::json!({
                "error": format!("Invalid input: {}", e)
            }).to_string();
        }
    };

    let total_cost: f64 = records.iter().map(|r| r.cost).sum();
    let total_duration: u64 = records.iter().map(|r| r.duration_seconds).sum();
    let record_count = records.len();

    let result = serde_json::json!({
        "total_cost": total_cost,
        "total_duration_seconds": total_duration,
        "record_count": record_count,
        "average_cost_per_record": if record_count > 0 { total_cost / record_count as f64 } else { 0.0 }
    });

    result.to_string()
}

/// Parse ISO 8601 timestamp to Unix timestamp (simplified)
fn parse_timestamp(timestamp: &str) -> i64 {
    // Simplified parser - in production, use proper ISO 8601 parser
    // This assumes format: "2024-01-01T00:00:00Z" or "2024-01-01T00:00:00.000Z"
    if let Some(t_part) = timestamp.split('T').next() {
        // Extract date components
        let parts: Vec<&str> = t_part.split('-').collect();
        if parts.len() == 3 {
            if let (Ok(year), Ok(month), Ok(day)) = (
                parts[0].parse::<i32>(),
                parts[1].parse::<u32>(),
                parts[2].parse::<u32>(),
            ) {
                // Simple calculation (not accounting for leap years, etc.)
                // This is a simplified version for demonstration
                let days_since_epoch = (year - 1970) * 365 + (month as i32 - 1) * 30 + day as i32;
                return days_since_epoch as i64 * 86400;
            }
        }
    }
    0
}

/// Generate metering record ID
#[wasm_bindgen]
pub fn generate_metering_record_id() -> String {
    #[cfg(target_arch = "wasm32")]
    {
        use js_sys::Date;
        let timestamp = Date::now() as u64;
        format!("meter_{}_{}", timestamp, (timestamp % 100000))
    }
    
    #[cfg(not(target_arch = "wasm32"))]
    {
        use std::time::{SystemTime, UNIX_EPOCH};
        let timestamp = SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .unwrap()
            .as_secs();
        format!("meter_{}_{}", timestamp, (timestamp % 100000))
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_calculate_usage_cost() {
        let input = MeteringInput {
            rental_id: "rental_123".to_string(),
            start_time: "2024-01-01T00:00:00Z".to_string(),
            end_time: "2024-01-01T01:00:00Z".to_string(),
            resource_type: "RAM".to_string(),
            amount: 8.0,
            price_per_unit_per_time: 0.1,
        };
        
        let input_json = serde_json::to_string(&input).unwrap();
        let result_json = calculate_usage_cost_json(&input_json);
        let result: UsageRecord = serde_json::from_str(&result_json).unwrap();
        
        assert_eq!(result.rental_id, "rental_123");
        assert!(result.cost > 0.0);
    }
}

