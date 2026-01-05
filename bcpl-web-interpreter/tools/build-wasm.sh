#!/bin/bash

# This script builds the WebAssembly module from the BCPL source code.

# Set the source file and output file
SOURCE_FILE="path/to/bcpl/source/file.bcpl"
OUTPUT_FILE="../src/wasm/icint.wasm"

# Compile the BCPL source code to WebAssembly
# Replace `bcpl-compiler` with the actual command to compile BCPL to WebAssembly
bcpl-compiler "$SOURCE_FILE" -o "$OUTPUT_FILE"

# Check if the compilation was successful
if [ $? -eq 0 ]; then
  echo "WebAssembly module built successfully: $OUTPUT_FILE"
else
  echo "Failed to build WebAssembly module."
  exit 1
fi