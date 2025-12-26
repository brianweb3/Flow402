// Example usage of the Rust crypto library

use flow402_crypto::*;

fn main() {
    // Example 1: Hashing
    println!("SHA-256 hash of 'hello': {}", sha256_hash("hello"));
    println!("SHA3-256 hash of 'hello': {}", sha3_256_hash("hello"));

    // Example 2: Payment proof verification
    let payment_id = "payment_123";
    let proof = "proof_abc";
    let hash = generate_payment_proof_hash(payment_id, proof);
    println!("Payment proof hash: {}", hash);
    
    let is_valid = verify_payment_proof(payment_id, proof, &hash);
    println!("Payment proof valid: {}", is_valid);

    // Example 3: Calculate rental cost
    let input = serde_json::json!({
        "resource_type": "RAM",
        "amount": 8.0,
        "duration_minutes": 60.0,
        "price_per_unit_per_time": 0.1,
        "currency": "USDC",
        "platform_fee_percent": 5.0
    });
    
    let result = calculate_rental_cost_json(&input.to_string());
    println!("Rental cost calculation: {}", result);

    // Example 4: Validate wallet address
    let eth_address = "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb";
    println!("Ethereum address valid: {}", validate_wallet_address(eth_address));
    
    let solana_address = "So11111111111111111111111111111111111111112";
    println!("Solana address valid: {}", validate_wallet_address(solana_address));

    // Example 5: Generate payment ID
    let payment_id = generate_payment_id();
    println!("Generated payment ID: {}", payment_id);
}

