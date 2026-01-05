# BCPL Web Interpreter - Quick Start

## 🚀 What You Have

A complete, working BCPL interpreter that runs in your web browser!

## 📦 What's Included

### Core Application
- **Full BCPL Interpreter** - Runs BCPL code directly in JavaScript
- **Modern Web Interface** - Beautiful, responsive UI with dark-themed editor
- **Example Programs** - 3 ready-to-run BCPL programs
- **File Support** - Upload/download .b files
- **Real-time Execution** - Instant feedback

### Documentation
- **README.md** - Project overview and setup
- **USER_GUIDE.md** - Complete user manual with examples
- **IMPLEMENTATION.md** - Technical details and architecture
- **This file** - Quick start guide

## ⚡ Get Started in 30 Seconds

### Option 1: Quick Start (No Installation)
```bash
cd bcpl-web-interpreter
npm install
npm start
```
Then open: http://localhost:8080

### Option 2: Just Open It
Open `src/index.html` directly in your browser (file:// mode works too!)

## 🎯 Try It Now

1. **Click "▶️ Run Code"** - Execute the pre-loaded example
2. **Select "Loop Example"** - Try a different program
3. **Edit the code** - Make changes and run again
4. **Upload a file** - Test with your own .b files

## 📝 Write Your First Program

Replace the editor content with:

```bcpl
GET "LIBHDR"

LET START() BE $(
  WRITES("I'm programming in BCPL!*N")
  FOR I = 1 TO 5 DO $(
    WRITEF("Count: %I*N", I)
  $)
$)
```

Click "Run" and see the output!

## 🎓 Learn BCPL

Check out:
- **Examples dropdown** - 3 working programs
- **USER_GUIDE.md** - Comprehensive tutorial
- **Output panel** - See results immediately

## 🏗️ What's Implemented

✅ BCPL core syntax
✅ FOR loops
✅ Global/local variables  
✅ Output functions (WRITES, WRITEF, etc.)
✅ Arithmetic expressions
✅ Format specifiers
✅ Escape sequences

## 🌐 Works Everywhere

- ✅ Chrome/Edge
- ✅ Firefox
- ✅ Safari
- ✅ Opera
- ✅ Mobile browsers

## 📚 Key Files

```
src/
├── index.html              # Open this to start!
├── js/
│   ├── bcplInterpreter.js  # The BCPL engine
│   ├── main.js             # UI controller
│   └── fileHandler.js      # File operations
├── css/
│   └── styles.css          # Beautiful styling
└── examples/
    ├── hello.b             # Hello World
    ├── loop.b              # Loops demo
    └── fibonacci.b         # Fibonacci sequence
```

## 🎨 Features

- 🖥️ Split-screen editor and output
- 🌙 Dark-themed code editor
- 📁 File upload/download
- 📚 Built-in examples
- ✨ Instant execution
- 🎯 Clear error messages
- 💾 Auto-formatting

## 🔧 Troubleshooting

**Examples not loading?**
- Make sure server is running: `npm start`
- Check examples are in `src/examples/`

**Code not running?**
- Ensure `LET START() BE` is present
- Check all `$(` have matching `$)`
- Include `GET "LIBHDR"` at the top

**Need help?**
- Read USER_GUIDE.md for detailed examples
- Check IMPLEMENTATION.md for technical details
- Inspect browser console (F12) for errors

## 🎉 Have Fun!

You now have a complete BCPL development environment in your browser. Experiment, learn, and enjoy this classic programming language!

## 📖 Next Steps

1. **Run all 3 examples** - See different BCPL features
2. **Modify examples** - Change values and see what happens
3. **Write your own** - Create something new
4. **Read USER_GUIDE.md** - Learn all features
5. **Share with friends** - Host it anywhere!

---

**Server Running?** Check http://localhost:8080
**Need Help?** See USER_GUIDE.md
**Want Details?** Read IMPLEMENTATION.md

**Enjoy coding in BCPL! 🚀**
