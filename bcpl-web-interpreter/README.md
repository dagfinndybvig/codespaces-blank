# BCPL Web Interpreter

A fully functional web-based interpreter for BCPL (Basic Combined Programming Language) that runs directly in your browser using pure JavaScript - no WebAssembly required!

## Features

- ✨ **Pure JavaScript Implementation** - No compilation needed, runs directly in browser
- 📝 **Interactive Code Editor** - Write and edit BCPL code with syntax highlighting
- ▶️ **Instant Execution** - Run BCPL programs with immediate output
- 📁 **File Support** - Upload `.b` files or download your code
- 🎯 **Built-in Examples** - Learn BCPL with pre-loaded example programs
- 🎨 **Modern UI** - Clean, responsive interface with dark theme editor

## Project Structure

```
bcpl-web-interpreter/
├── src/
│   ├── index.html              # Main web interface
│   ├── css/
│   │   └── styles.css          # Modern styling with gradients
│   └── js/
│       ├── main.js             # Application controller
│       ├── bcplInterpreter.js  # BCPL interpreter core
│       └── fileHandler.js      # File operations handler
├── examples/
│   ├── hello.b                 # Hello World example
│   ├── loop.b                  # Loop demonstration
│   └── fibonacci.b             # Fibonacci sequence
├── tools/
│   └── build-wasm.sh           # (Optional) WebAssembly build script
├── package.json                # npm configuration
└── README.md                   # This file
```

## Getting Started

### Quick Start (No Installation)

Simply open [src/index.html](src/index.html) in any modern web browser and start coding!

### Using a Local Server

For better file handling and to avoid CORS issues when loading examples:

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Start the Server**
   ```bash
   npm start
   ```

3. **Open in Browser**
   Navigate to `http://localhost:8080`

## Usage

### Writing BCPL Code

Every BCPL program needs a `START()` function as its entry point:

```bcpl
GET "LIBHDR"

LET START() BE $(
  WRITES("Hello, World!*N")
$)
```

### Supported Features

The interpreter currently supports:

- **Output Functions**: `WRITES()`, `WRITEF()`, `WRITEN()`, `WRCH()`, `NEWLINE()`
- **Control Structures**: `FOR...TO...DO` loops, `IF...THEN...ELSE`
- **Variables**: Global declarations with `GLOBAL`, local with `LET`
- **Operators**: Arithmetic (`+`, `-`, `*`, `/`), comparison, logical
- **Escape Sequences**: `*N` (newline), `*T` (tab), `*S` (space)
- **Format Specifiers**: `%I` (integer), `%N` (number)

### Example Programs

#### Hello World
```bcpl
GET "LIBHDR"

LET START() BE $(
  WRITES("Hello, BCPL World!*N")
$)
```

#### Loop Example
```bcpl
GET "LIBHDR"

LET START() BE $(
  FOR I = 1 TO 10 DO $(
    WRITEF("Number %I2*N", I)
  $)
$)
```

#### Fibonacci Sequence
```bcpl
GET "LIBHDR"

GLOBAL $(
  A: 200;
  B: 201
$)

LET START() BE $(
  A := 0
  B := 1
  
  FOR I = 3 TO 15 DO $(
    LET C = A + B
    WRITEF("%I5", C)
    A := B
    B := C
  $)
$)
```

## BCPL Quick Reference

### Program Structure
- `GET "LIBHDR"` - Include standard library
- `LET START() BE $( ... $)` - Main entry point
- `$( ... $)` - Block delimiters

### Output Functions
- `WRITES("text")` - Write a string
- `WRITEF("format", args...)` - Formatted output
- `WRITEN(number)` - Write a number
- `WRCH(char)` - Write a character
- `NEWLINE()` - Write a newline

### Control Flow
- `FOR var = start TO end DO $( ... $)` - Loop
- `IF condition THEN action`
- `TEST condition THEN action ELSE action`
- `WHILE condition DO action`

### Variables
- `LET name = value` - Local variable
- `GLOBAL $( name: address $)` - Global variable
- `name := value` - Assignment

### Operators
- Arithmetic: `+`, `-`, `*`, `/`, `REM` (remainder)
- Comparison: `=`, `~=`, `<`, `>`, `<=`, `>=`
- Logical: `&` (AND), `|` (OR), `~` (NOT)
- Bitwise: `<<` (left shift), `>>` (right shift)

### Escape Sequences
- `*N` - Newline
- `*T` - Tab
- `*S` - Space

## About BCPL

BCPL (Basic Combined Programming Language) was designed by Martin Richards at Cambridge University in 1966. It was influential in the development of many later languages, most notably C. BCPL pioneered several concepts including:

- Portability through intermediate code
- Typeless programming (single data type)
- Structured programming constructs
- Systems programming capabilities

## Browser Compatibility

Works in all modern browsers:
- ✅ Chrome/Edge (v90+)
- ✅ Firefox (v88+)
- ✅ Safari (v14+)
- ✅ Opera (v76+)

## Limitations

This is a simplified interpreter focused on educational use. Some advanced BCPL features are not yet implemented:

- Full OCODE/INTCODE compilation
- Advanced pointer operations
- Complete BLIB functions
- Assembly-level operations

## Contributing

Contributions are welcome! Feel free to:
- Add more example programs
- Enhance the interpreter features
- Improve the UI/UX
- Fix bugs or add optimizations

## License

MIT License - Feel free to use and modify for educational purposes.

## Resources

- [BCPL: The Language and Its Compiler](https://www.cl.cam.ac.uk/~mr10/bcplman.pdf)
- [Martin Richards' BCPL Distribution](https://www.cl.cam.ac.uk/~mr10/)
- Original BCPL Documentation
   Open `src/index.html` in your web browser. You can upload a BCPL source file and execute it.

## Usage

- Use the upload button to select a BCPL source file (e.g., `hello.b`).
- Click the "Run" button to execute the uploaded BCPL code.
- The output will be displayed on the webpage.

## Contributing

Contributions are welcome! Please feel free to submit a pull request or open an issue for any enhancements or bug fixes.

## License

This project is licensed under the MIT License. See the LICENSE file for more details.