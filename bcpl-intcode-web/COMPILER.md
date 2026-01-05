# BCPL Web Compiler - Implementation Guide

## Overview

The bcpl-intcode-web project now includes a **full BCPL compiler** that runs entirely in the browser! This follows the exact same pattern as bcpl-c64-code-r8.

## How It Works

### The Compilation Pipeline

```
┌──────────────────────────────────────────────────────────────┐
│  BCPL Source Code (.b file)                                  │
│  ↓                                                            │
│  Stage 1: syni (Syntax Analyzer) → OCODE                    │
│  ↓                                                            │
│  Stage 2: trni (Translator) → OCODE (transformed)           │
│  ↓                                                            │
│  Stage 3: cgi (Code Generator) → INTCODE                    │
│  ↓                                                            │
│  Stage 4: Execute INTCODE in VM                              │
└──────────────────────────────────────────────────────────────┘
```

### Key Innovation

The BCPL compiler itself is **written in BCPL** and compiled to INTCODE!

- `syni`, `trni`, and `cgi` are executable INTCODE programs
- They run inside the JavaScript INTCODE VM
- Each stage reads input, processes it, and outputs results
- This is **exactly** how the C64 version works!

## Architecture Comparison

### bcpl-c64-code-r8 (C Implementation)

```c
// From icint.c
main(argc, argv) {
  init();
  loadcode("syni");   // Load syntax analyzer INTCODE
  loadcode("trni");   // Load translator INTCODE
  // Set input to BCPL source file
  interpret();        // Run syni+trni pipeline
  
  loadcode("cgi");    // Load code generator INTCODE
  // Set input to previous output (OCODE)
  interpret();        // Run cgi to generate INTCODE
  
  // Now run the generated INTCODE
  loadcode("intcode");
  interpret();
}
```

### bcpl-intcode-web (JavaScript Implementation)

```javascript
// From compiler.js
async compile(sourceCode) {
  // Stage 1: Syntax analyzer
  const ocode1 = await this.runStage(this.syniCode, sourceCode);
  
  // Stage 2: Translator
  const ocode2 = await this.runStage(this.trniCode, ocode1);
  
  // Stage 3: Code generator
  const intcode = await this.runStage(this.cgiCode, ocode2);
  
  return intcode;
}

async runStage(stageCode, input) {
  this.vm.loadIntcode(stageCode);  // Load compiler stage
  this.vm.inputBuffer = input;      // Set input
  return this.vm.run().output;      // Run and return output
}
```

## Files Added

### 1. Compiler Components (copied from bcpl-c64-code-r8)

```
bcpl-intcode-web/examples/
├── syni    (25KB) - Syntax analyzer INTCODE
├── trni    (21KB) - Translator INTCODE
└── cgi     (14KB) - Code generator INTCODE
```

### 2. New Web Interface

```
bcpl-intcode-web/src/
├── compile.html         - Compiler UI
└── js/
    └── compiler.js      - Compiler controller
```

## Usage

### Option 1: Use the Web Interface

1. Start the server:
   ```bash
   cd bcpl-intcode-web
   npm start
   ```

2. Navigate to: `http://localhost:8081/compile.html`

3. Write or load BCPL source code

4. Click **"Compile & Run"**

### Option 2: Programmatic Usage

```javascript
const compiler = new BCPLCompiler();

// Compile BCPL source
const result = await compiler.compile(sourceCode);
console.log('Generated INTCODE:', result.intcode);

// Compile and run
const fullResult = await compiler.compileAndRun(sourceCode);
console.log('Program output:', fullResult.runOutput);
```

## Example BCPL Program

```bcpl
GET "LIBHDR"

LET START() BE $(
  WRITES("Hello from BCPL Compiler!*N")
  FOR I = 1 TO 10 DO $(
    WRITEF("Count: %I3*N", I)
  $)
$)
```

This will:
1. Pass through syni → parses syntax
2. Pass through trni → transforms to intermediate form
3. Pass through cgi → generates INTCODE
4. Execute in the VM → prints output

## Technical Details

### Stage Communication

Each compilation stage:
- Reads from `vm.inputBuffer` (byte array)
- Writes to `vm.outputBuffer` (string output)
- Stages are chained: output of stage N → input of stage N+1

### OCODE Format

OCODE (Object Code) is an intermediate representation:
- Output of syni and trni
- Input to cgi
- Text-based format (not binary)
- Contains parsed and transformed BCPL constructs

### Error Handling

Compilation errors are detected by:
- VM execution failures (syntax errors)
- Empty output from stages
- Runtime errors during execution

## Comparison with C64 Version

| Aspect | bcpl-c64-code-r8 | bcpl-intcode-web |
|--------|------------------|------------------|
| **Compiler Location** | INTCODE files | Same INTCODE files |
| **VM Implementation** | C (icint.c) | JavaScript (intcodeVM.js) |
| **Stage Execution** | Sequential C calls | Async JavaScript |
| **I/O** | File system | Memory buffers |
| **Pipeline** | Identical | Identical |
| **Output** | Text files | In-memory strings |

## What This Demonstrates

1. **VM Portability**: The same INTCODE runs on C64 (1982) and modern browsers (2026)
2. **Self-Hosting**: BCPL compiler written in BCPL
3. **Clean Architecture**: Compiler stages are independent programs
4. **Historical Preservation**: Original 1970s BCPL system running in 2026 browser

## Limitations

Currently implemented:
- ✅ Full three-stage compilation pipeline
- ✅ All BCPL language features supported by the compiler
- ✅ Complete INTCODE instruction set

Not yet implemented:
- ❌ File I/O (uses memory buffers instead)
- ❌ Debugger/step-through execution
- ❌ INTCODE visualization

## Future Enhancements

Potential improvements:
1. Add syntax highlighting for BCPL
2. Show intermediate OCODE between stages
3. Add INTCODE disassembler/viewer
4. Implement step-by-step debugger
5. Add more example programs
6. Create interactive tutorials

## Credits

- **Original BCPL System**: Martin Richards (1960s)
- **C64 Implementation**: bcpl-c64-code-r8 project
- **JavaScript Port**: bcpl-intcode-web project
- **Compiler Components**: syni, trni, cgi (from original BCPL Kit)

## See Also

- `bcpl-c64-code-r8/README` - Original C64 implementation
- `bcpl-intcode-web/README.md` - Project overview
- `bcpl-intcode-web/src/js/intcodeVM.js` - VM implementation
