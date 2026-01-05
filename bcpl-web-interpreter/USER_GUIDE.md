# BCPL Web Interpreter - User Guide

## Introduction

Welcome to the BCPL Web Interpreter! This guide will help you get started with writing and running BCPL programs in your browser.

## Getting Started

### Opening the Interpreter

1. Open your browser and navigate to `http://localhost:8080`
2. You'll see the BCPL Web Interpreter interface with:
   - A code editor on the left
   - An output panel on the right
   - A toolbar with various controls

### Running Your First Program

The editor comes pre-loaded with a simple example. Just click the "▶️ Run Code" button to execute it!

## Interface Overview

### Toolbar Buttons

- **📁 Open File**: Upload a BCPL file (.b extension) from your computer
- **💾 Download**: Save your current code to a file
- **🗑️ Clear**: Clear the editor (asks for confirmation)
- **Load Example**: Load one of the built-in example programs
- **▶️ Run Code**: Execute your BCPL program

### Code Editor

- Dark-themed editor optimized for code
- Tab key for indentation
- Monospace font for clear formatting
- Real-time editing

### Output Panel

- Displays program output
- Green border for successful execution
- Red border for errors
- Scrollable for long outputs

## Writing BCPL Programs

### Basic Structure

Every BCPL program must have a `START()` function:

```bcpl
GET "LIBHDR"

LET START() BE $(
  WRITES("Your code here*N")
$)
```

### Key Elements

1. **GET "LIBHDR"**: Includes the standard library (required)
2. **LET START() BE**: Declares the main function
3. **$( ... $)**: Block delimiters (like { } in C)
4. **Function calls**: End statements with appropriate syntax

### Output Functions

#### WRITES - Write a String

```bcpl
WRITES("Hello, World!*N")
```

Use escape sequences:
- `*N` for newline
- `*T` for tab
- `*S` for space

#### WRITEF - Formatted Output

```bcpl
WRITEF("The number is %I2*N", 42)
```

Format specifiers:
- `%I` or `%I2`: Integer (with optional width)
- `%N`: Number

#### WRITEN - Write a Number

```bcpl
WRITEN(123)
```

### Variables

#### Local Variables

```bcpl
LET x = 10
LET y = 20
LET sum = x + y
```

#### Global Variables

```bcpl
GLOBAL $(
  COUNT: 200;
  TOTAL: 201
$)

LET START() BE $(
  COUNT := 0
  TOTAL := 100
$)
```

### Control Structures

#### FOR Loop

```bcpl
FOR i = 1 TO 10 DO $(
  WRITEF("Count: %I*N", i)
$)
```

#### Nested Loops

```bcpl
FOR i = 1 TO 3 DO $(
  FOR j = 1 TO 3 DO $(
    WRITEF("i=%I j=%I*N", i, j)
  $)
$)
```

### Arithmetic Operations

```bcpl
LET a = 10 + 5    // Addition
LET b = 10 - 5    // Subtraction
LET c = 10 * 5    // Multiplication
LET d = 10 / 5    // Division
```

## Example Programs

### Example 1: Hello World

```bcpl
GET "LIBHDR"

LET START() BE $(
  WRITES("Hello, World!*N")
  WRITES("Welcome to BCPL!*N")
$)
```

### Example 2: Counting Loop

```bcpl
GET "LIBHDR"

LET START() BE $(
  WRITES("Counting from 1 to 10:*N")
  FOR I = 1 TO 10 DO $(
    WRITEF("Number %I2*N", I)
  $)
  WRITES("*NDone!*N")
$)
```

### Example 3: Fibonacci Sequence

```bcpl
GET "LIBHDR"

GLOBAL $(
  A: 200;
  B: 201
$)

LET START() BE $(
  WRITES("Fibonacci sequence:*N")
  A := 0
  B := 1
  
  WRITEF("%I5", A)
  WRITEF("%I5", B)
  
  FOR I = 3 TO 15 DO $(
    LET C = A + B
    WRITEF("%I5", C)
    A := B
    B := C
  $)
  
  WRITES("*N")
$)
```

### Example 4: Multiplication Table

```bcpl
GET "LIBHDR"

LET START() BE $(
  WRITES("5 Times Table:*N")
  FOR I = 1 TO 10 DO $(
    LET result = 5 * I
    WRITEF("5 x %I2 = %I2*N", I, result)
  $)
$)
```

## Tips and Best Practices

### 1. Always Include LIBHDR

Start every program with:
```bcpl
GET "LIBHDR"
```

### 2. Use Meaningful Variable Names

```bcpl
// Good
LET studentCount = 30

// Less clear
LET x = 30
```

### 3. Add Newlines for Readability

Always end output with `*N` for proper formatting:
```bcpl
WRITES("Message*N")  // Good
WRITES("Message")    // Output runs together
```

### 4. Format Numbers for Alignment

Use width specifiers for neat columns:
```bcpl
WRITEF("%I3", number)  // Right-aligned in 3 spaces
```

### 5. Test Incrementally

- Write a small piece of code
- Run it to verify it works
- Add more functionality
- Run again

## Troubleshooting

### Common Errors

#### "No START() function found"
- **Cause**: Missing or misspelled START function
- **Solution**: Ensure you have `LET START() BE $( ... $)`

#### "Syntax Error"
- **Cause**: Missing delimiters, parentheses, or quotes
- **Solution**: Check that all `$(` have matching `$)`, all `"` are closed

#### No Output
- **Cause**: Missing `*N` newlines or no output statements
- **Solution**: Add `WRITES()` or `WRITEF()` calls with `*N`

### Getting Help

If you encounter issues:
1. Check the syntax in this guide
2. Try running one of the built-in examples
3. Start with a simple program and build up
4. Use the browser console (F12) for JavaScript errors

## Keyboard Shortcuts

While in the editor:
- **Tab**: Indent
- **Shift+Tab**: Outdent
- **Ctrl+A** (Cmd+A): Select all
- **Ctrl+C** (Cmd+C): Copy
- **Ctrl+V** (Cmd+V): Paste

## Loading and Saving Files

### Loading Files

1. Click "📁 Open File"
2. Select a `.b` file from your computer
3. The code will appear in the editor

### Saving Files

1. Click "💾 Download"
2. The file will be saved with the current filename
3. Default name is the loaded file or "program.b"

### Loading Examples

1. Select an example from the dropdown menu
2. Click "Load Example"
3. The example code will replace current editor content

## Advanced Topics

### Global Variables

Use global variables for values that need to persist across function calls:

```bcpl
GLOBAL $(
  counter: 200;
  total: 201
$)
```

### Variable Assignment

Use `:=` for assignment:
```bcpl
counter := 0
total := total + 1
```

### Expressions

Combine operations in expressions:
```bcpl
LET result = (a + b) * c - d / 2
```

## Limitations

Current interpreter limitations:
- No function definitions beyond START
- Limited library functions
- No pointer operations
- No file I/O
- No dynamic memory allocation

This is an educational interpreter focused on core BCPL concepts.

## Resources

- [Martin Richards' BCPL Page](https://www.cl.cam.ac.uk/~mr10/)
- [BCPL Manual](https://www.cl.cam.ac.uk/~mr10/bcplman.pdf)
- More examples in the `/examples` folder

## Have Fun!

BCPL is a historically significant language that influenced many modern languages. Experiment, learn, and enjoy exploring this classic programming language!
