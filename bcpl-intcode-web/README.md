# BCPL INTCODE Web Interpreter

A web-based INTCODE virtual machine that runs compiled BCPL bytecode in the browser.

## 🎉 NEW: Full BCPL Compiler Included!

This project now includes a **complete BCPL compiler** that runs entirely in the browser! You can:
- ✅ Write BCPL source code in the browser
- ✅ Compile it to INTCODE using the original compiler (syni/trni/cgi)
- ✅ Run the compiled INTCODE immediately
- ✅ All in one web page!

See [COMPILER.md](COMPILER.md) for details.

## Architecture

This project takes a different approach than parsing BCPL directly:

1. **INTCODE VM** - JavaScript implementation of the INTCODE virtual machine
2. **BCPL Compiler** - Runs syni/trni/cgi INTCODE to compile BCPL source
3. **Binary Loader** - Loads compiled INTCODE files
4. **System Functions** - Implements BCPL runtime (WRITES, WRITEF, etc.)
5. **Web Interface** - Upload and run compiled INTCODE programs

## How It Works

BCPL compilation flow:
```
BCPL Source (.b) → Compiler (syni/trni/cgi) → INTCODE → INTCODE Interpreter → Output
                     ↑_____________ALL RUN IN THE BROWSER!____________↑
```

This interpreter implements the INTCODE virtual machine that executes the compiled bytecode.

## Getting Started

```bash
npm install
npm start
```

Open http://localhost:8080
