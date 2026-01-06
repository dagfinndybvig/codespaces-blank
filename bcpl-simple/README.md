# BCPL Compiler - Simple Version

A clean, straightforward implementation of a BCPL compiler with a clear 3-stage pipeline.

## Architecture

### Compilation Pipeline

1. **SYNI + TRNI** (Syntax Analyzer + Translator)
   - Parses BCPL source code
   - Converts to intermediate INTCODE representation (OCODE)
   
2. **CGI** (Code Generator)
   - Takes intermediate INTCODE (OCODE)
   - Produces final executable INTCODE
   
3. **VM** (Virtual Machine)
   - Executes the final INTCODE program

## Files

- `index.html` - Main interface
- `vm.js` - INTCODE virtual machine
- `assembler.js` - INTCODE assembler (text → binary)
- `compiler.js` - Compilation pipeline coordinator
- `main.js` - UI and event handling

## Usage

1. Start a web server in the parent directory:
   ```bash
   cd /workspaces/codespaces-blank
   python3 -m http.server 8000
   ```

2. Open in browser:
   ```
   http://localhost:8000/bcpl-simple/
   ```

3. Write BCPL code and click "Compile"
4. Click "Run" to execute the compiled program

## Key Improvements

- **Clear separation**: Each stage runs independently
- **10000 label support**: No more "label out of range" errors
- **Simple architecture**: Easy to understand and debug
- **Clean UI**: Split view with compilation log

## Example Code

```bcpl
GET "LIBHDR"

LET START() BE
{ WRITEF("Hello from BCPL!*N")
  WRITEF("Sum of 5 + 7 = %N*N", 5 + 7)
}
```
