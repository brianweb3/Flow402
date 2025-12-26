#!/bin/bash
# Build script for Rust library

set -e

echo "Building Rust library..."

# Check if wasm-pack is installed
if ! command -v wasm-pack &> /dev/null; then
    echo "wasm-pack not found. Installing..."
    cargo install wasm-pack
fi

# Build for web target
echo "Building WebAssembly module..."
wasm-pack build --target web --out-dir pkg

echo "Build complete! Output in rust-lib/pkg/"

