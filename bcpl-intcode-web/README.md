# BCPL INTCODE Web Interpreter

A web-based INTCODE virtual machine that runs compiled BCPL bytecode in the browser.

## Architecture

This project takes a different approach than parsing BCPL directly:

1. **INTCODE VM** - JavaScript implementation of the INTCODE virtual machine
2. **Binary Loader** - Loads compiled INTCODE files
3. **System Functions** - Implements BCPL runtime (WRITES, WRITEF, etc.)
4. **Web Interface** - Upload and run compiled INTCODE programs

## How It Works

BCPL compilation flow:
```
BCPL Source (.b) → Compiler (syni/trni/cgi) → INTCODE → INTCODE Interpreter → Output
```

This interpreter implements the INTCODE virtual machine that executes the compiled bytecode.

## Getting Started

```bash
npm install
npm start
```

Open http://localhost:8080
