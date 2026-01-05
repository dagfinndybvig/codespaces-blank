// INTCODE Virtual Machine
// Based on icint.c from BCPL C64 implementation

class IntcodeVM {
    constructor() {
        // Memory array (equivalent to m[] in C)
        this.WORDCOUNT = 19900;
        this.PROGSTART = 401;
        this.memory = new Array(this.WORDCOUNT).fill(0);
        
        // Registers
        this.pc = this.PROGSTART;  // Program counter
        this.sp = 0;                // Stack pointer
        this.a = 0;                 // A register
        this.b = 0;                 // B register
        
        // I/O streams
        this.outputBuffer = [];
        this.inputBuffer = [];
        this.inputPos = 0;
        
        // Stream handles (like in icint.c)
        this.cis = 1;  // Current input stream (1 = stdin)
        this.cos = 1;  // Current output stream (1 = stdout)
        this.sysin = 1;
        this.sysprint = 1;
        
        // System variables
        this.lomem = this.PROGSTART;
        this.himem = this.WORDCOUNT - 1;
        
        // Instruction flags
        this.FN_BITS = 8;
        this.F_MASK = 0xFF;
        this.FI_BIT = (1 << 3);
        this.FP_BIT = (1 << 4);
        this.FD_BIT = (1 << 5);
        
        // Instruction types
        this.F0_L = 0;  // Load
        this.F1_S = 1;  // Store
        this.F2_A = 2;  // Add
        this.F3_J = 3;  // Jump
        this.F4_T = 4;  // Jump if true
        this.F5_F = 5;  // Jump if false
        this.F6_K = 6;  // Call
        this.F7_X = 7;  // Execute operator
        
        // System call numbers (K-codes)
        this.K_CALLS = {
            START: 1,
            SETPM: 2,
            ABORT: 3,
            BACKTRACE: 4,
            SELECTINPUT: 11,
            SELECTOUTPUT: 12,
            RDCH: 13,
            WRCH: 14,
            UNRDCH: 15,
            INPUT: 16,
            OUTPUT: 17,
            STOP: 30,
            LEVEL: 31,
            LONGJUMP: 32,
            BINWRCH: 34,
            REWIND: 35,
            APTOVEC: 40,
            FINDOUTPUT: 41,
            FINDINPUT: 42,
            ENDREAD: 46,
            ENDWRITE: 47,
            WRITES: 60,
            WRITEN: 62,
            NEWLINE: 63,
            NEWPAGE: 64,
            WRITEO: 65,
            PACKSTRING: 66,
            UNPACKSTRING: 67,
            WRITED: 68,
            WRITEARG: 69,
            READN: 70,
            TERMINATOR: 71,
            WRITEX: 74,
            WRITEHEX: 75,
            WRITEF: 76,
            WRITEOCT: 77,
            MAPSTORE: 78,
            GETBYTE: 85,
            PUTBYTE: 86,
            GETVEC: 87,
            FREEVEC: 88,
            RANDOM: 89,
            MULDIV: 90,
            RESULT2: 91
        };
        
        this.running = false;
    }
    
    // Convert to 16-bit signed integer (-32768 to 32767)
    toSigned16(value) {
        // Wrap to 16-bit range
        value = value & 0xFFFF;
        // Convert to signed
        if (value >= 0x8000) {
            return value - 0x10000;
        }
        return value;
    }
    
    // Load INTCODE from binary data
    loadIntcode(data) {
        // Assembler returns full memory array (0 to lomem)
        // Copy entire array including globals (0-400) and program (401+)
        for (let i = 0; i < data.length; i++) {
            this.memory[i] = data[i];
        }
        this.lomem = data.length;
        this.sp = this.lomem;
        
        console.log(`Loaded ${data.length} words into memory`);
        console.log(`Program starts at ${this.PROGSTART}`);
        console.log(`First instruction at PC=${this.PROGSTART}: ${this.memory[this.PROGSTART]}`);
        console.log(`Next word: ${this.memory[this.PROGSTART + 1]}`);
    }
    
    // Run the program
    run() {
        this.running = true;
        this.pc = this.PROGSTART;
        this.sp = this.lomem;
        this.a = 0;
        this.b = 0;
        this.outputBuffer = [];
        
        console.log(`Starting execution at PC=${this.pc}, SP=${this.sp}`);
        console.log(`Memory loaded: ${this.lomem - this.PROGSTART} words`);
        console.log(`First instruction at PC=${this.pc}: ${this.memory[this.pc]}`);
        
        let instructionCount = 0;
        const maxInstructions = 10000000; // Very high limit for compiler stages
        
        try {
            while (this.running && instructionCount < maxInstructions) {
                if (instructionCount < 10) {  // Only trace first 10 instructions
                    const inst = this.memory[this.pc];
                    const opcode = inst & 0x7;
                    const opcodeNames = ['L', 'S', 'A', 'J', 'T', 'F', 'K', 'X'];
                    console.log(`[${instructionCount}] PC=${this.pc}, A=${this.a}, B=${this.b}, SP=${this.sp}, Inst=${inst} (${opcodeNames[opcode]})`);
                }
                this.executeInstruction();
                instructionCount++;
            }
            
            if (instructionCount >= maxInstructions) {
                console.error(`=== INFINITE LOOP DETECTED ===`);
                console.error(`Last 5 PCs: PC=${this.pc}, A=${this.a}, B=${this.b}, SP=${this.sp}`);
                console.error(`Memory at PC: [${this.pc-2}]=${this.memory[this.pc-2]}, [${this.pc-1}]=${this.memory[this.pc-1]}, [${this.pc}]=${this.memory[this.pc]}, [${this.pc+1}]=${this.memory[this.pc+1]}`);
                throw new Error('Execution limit exceeded (possible infinite loop)');
            }
            
            console.log(`Execution completed after ${instructionCount} instructions`);
            return {
                success: true,
                output: this.outputBuffer.join('')
            };
        } catch (error) {
            console.error('Execution error:', error);
            return {
                success: false,
                output: this.outputBuffer.join(''),
                error: error.message
            };
        }
    }
    
    // Execute single instruction
    executeInstruction() {
        // Fetch instruction
        let w = this.memory[this.pc++];
        let d = (w & this.FD_BIT) ? this.memory[this.pc++] : (w >> this.FN_BITS);
        const rawD = d;  // Save for debugging
        
        // Apply modifiers
        if (w & this.FP_BIT) d += this.sp;  // P-relative
        if (w & this.FI_BIT) d = this.toSigned16(this.memory[d]);  // Indirect (treat as signed)
        
        // Decode and execute
        const opcode = w & this.F7_X;
        
        // Debug: Log jump instructions that go to address 0
        if (opcode === this.F3_J && d === 0) {
            console.log(`!!! Jump to 0: w=${w}, rawD=${rawD}, FP=${!!(w & this.FP_BIT)}, FI=${!!(w & this.FI_BIT)}, FD=${!!(w & this.FD_BIT)}, SP=${this.sp}`);
        }
        
        switch (opcode) {
            case this.F0_L:  // Load
                this.b = this.a;
                this.a = this.toSigned16(d);  // Treat loaded value as signed
                break;
                
            case this.F1_S:  // Store
                this.memory[d] = this.a;
                break;
                
            case this.F2_A:  // Add
                this.a = this.toSigned16(this.a + d);
                break;
                
            case this.F3_J:  // Jump
                this.pc = d;
                break;
                
            case this.F4_T:  // Jump if true
                if (this.a) this.pc = d;
                break;
                
            case this.F5_F:  // Jump if false
                if (!this.a) this.pc = d;
                break;
                
            case this.F6_K:  // Call
                d += this.sp;
                if (this.a < this.PROGSTART) {
                    // System call
                    console.log(`System call: A=${this.a}, frame at ${d}`);
                    this.executeSystemCall(this.a, d);
                } else {
                    // User function call
                    this.memory[d] = this.sp;
                    this.memory[d + 1] = this.pc;
                    this.sp = d;
                    this.pc = this.a;
                }
                break;
                
            case this.F7_X:  // Execute operator
                this.executeOperator(d);
                break;
                
            default:
                throw new Error(`Unknown opcode: ${opcode}`);
        }
    }
    
    // Execute system calls (K-codes)
    executeSystemCall(callNum, frameAddr) {
        const args = frameAddr + 2;
        
        console.log(`System call ${callNum} at frame ${frameAddr}`);
        
        switch (callNum) {
            case 0:
                // No-op or undefined call
                break;
                
            case this.K_CALLS.START:
            case this.K_CALLS.SETPM:
            case this.K_CALLS.ABORT:
            case this.K_CALLS.BACKTRACE:
                // System management - ignore for web version
                break;
                
            case this.K_CALLS.SELECTINPUT:
                this.cis = this.memory[args];
                console.log(`SELECTINPUT: ${this.cis}`);
                break;
                
            case this.K_CALLS.SELECTOUTPUT:
                this.cos = this.memory[args];
                console.log(`SELECTOUTPUT: ${this.cos}`);
                break;
                
            case this.K_CALLS.RDCH:
                this.a = this.rdch();
                break;
                
            case this.K_CALLS.WRCH:
                this.wrch(this.memory[args]);
                break;
                
            case this.K_CALLS.INPUT:
                this.a = this.cis; // Current input stream
                break;
                
            case this.K_CALLS.OUTPUT:
                this.a = this.cos; // Current output stream
                break;
                
            case this.K_CALLS.STOP:
                console.log('*** STOP called - terminating execution ***');
                this.running = false;
                this.a = this.memory[args]; // Return value
                return;  // Exit immediately
                
            case this.K_CALLS.LEVEL:
                this.a = this.sp;
                break;
                
            case this.K_CALLS.LONGJUMP:
                this.sp = this.memory[args];
                this.pc = this.memory[args + 1];
                break;
                
            case this.K_CALLS.APTOVEC:
                // Create closure/function vector
                const b = frameAddr + this.memory[args + 1] + 1;
                this.memory[b] = this.sp;
                this.memory[b + 1] = this.pc;
                this.memory[b + 2] = frameAddr;
                this.memory[b + 3] = this.memory[args + 1];
                this.sp = b;
                this.pc = this.memory[args];
                break;
                
            case this.K_CALLS.FINDOUTPUT:
                // Return sysprint (stdout) stream handle
                this.a = this.sysprint;
                console.log(`FINDOUTPUT called, returning ${this.a}`);
                break;
                
            case this.K_CALLS.FINDINPUT:
                // Return sysin (stdin) stream handle  
                this.a = this.sysin;
                console.log(`FINDINPUT called, returning ${this.a}`);
                break;
                
            case this.K_CALLS.ENDREAD:
            case this.K_CALLS.ENDWRITE:
                // File operations - not implemented
                break;
                
            case this.K_CALLS.WRITES:
                this.writes(this.memory[args]);
                break;
                
            case this.K_CALLS.WRITEN:
                this.writen(this.memory[args]);
                break;
                
            case this.K_CALLS.NEWLINE:
                this.newline();
                break;
                
            case this.K_CALLS.NEWPAGE:
                this.wrch(12); // Form feed
                break;
                
            case this.K_CALLS.PACKSTRING:
                // Pack string - simplified
                this.a = 0;
                break;
                
            case this.K_CALLS.UNPACKSTRING:
                // Unpack string - simplified
                break;
                
            case this.K_CALLS.WRITED:
                this.writed(this.memory[args], this.memory[args + 1]);
                break;
                
            case this.K_CALLS.READN:
                this.a = this.readn();
                break;
                
            case this.K_CALLS.WRITEHEX:
                this.writehex(this.memory[args], this.memory[args + 1]);
                break;
                
            case this.K_CALLS.WRITEOCT:
                this.writeoct(this.memory[args], this.memory[args + 1]);
                break;
                
            case this.K_CALLS.WRITEF:
                this.writef(args);
                break;
                
            case this.K_CALLS.GETBYTE:
                // Get byte from memory
                const getAddr = this.memory[args];
                const getOffset = this.memory[args + 1];
                this.a = this.getByteAt(getAddr, getOffset);
                break;
                
            case this.K_CALLS.PUTBYTE:
                // Put byte to memory
                const putAddr = this.memory[args];
                const putOffset = this.memory[args + 1];
                const putValue = this.memory[args + 2];
                this.setByteAt(putAddr, putOffset, putValue);
                break;
                
            case this.K_CALLS.GETVEC:
                // Allocate vector - simplified
                this.a = this.himem;
                this.himem -= this.memory[args];
                break;
                
            case this.K_CALLS.FREEVEC:
                // Free vector - no-op in simple version
                break;
                
            default:
                console.warn(`Unknown or unimplemented system call: ${callNum}`);
                break;
        }
    }
    
    // Execute arithmetic/logic operators
    executeOperator(op) {
        switch (op) {
            case 1:  // Indirection
                this.a = this.toSigned16(this.memory[this.a]);
                break;
            case 2:  // Negate
                this.a = this.toSigned16(-this.a);
                break;
            case 3:  // NOT
                this.a = this.toSigned16(~this.a);
                break;
            case 4:  // Return
                this.pc = this.memory[this.sp + 1];
                this.sp = this.memory[this.sp];
                break;
            case 5:  // Multiply
                this.a = this.toSigned16(this.b * this.a);
                break;
            case 6:  // Divide
                if (this.a) this.a = this.toSigned16(Math.floor(this.b / this.a));
                break;
            case 7:  // Remainder
                if (this.a) this.a = this.toSigned16(this.b % this.a);
                break;
            case 8:  // Add
                this.a = this.toSigned16(this.b + this.a);
                break;
            case 9:  // Subtract
                this.a = this.toSigned16(this.b - this.a);
                break;
            case 10:  // Equal
                this.a = -(this.b === this.a);
                break;
            case 11:  // Not equal
                this.a = -(this.b !== this.a);
                break;
            case 12:  // Less than
                this.a = -(this.b < this.a);
                break;
            case 13:  // Greater or equal
                this.a = -(this.b >= this.a);
                break;
            case 14:  // Greater than
                this.a = -(this.b > this.a);
                break;
            case 15:  // Less or equal
                this.a = -(this.b <= this.a);
                break;
            case 16:  // Left shift
                this.a = this.toSigned16(this.b << this.a);
                break;
            case 17:  // Right shift
                this.a = this.toSigned16(this.b >> this.a);
                break;
            case 18:  // Bitwise AND
                this.a = this.toSigned16(this.b & this.a);
                break;
            case 19:  // Bitwise OR
                this.a = this.toSigned16(this.b | this.a);
                break;
            case 20:  // Bitwise XOR
                this.a = this.toSigned16(this.b ^ this.a);
                break;
            case 21:  // Bitwise EQV
                this.a = this.toSigned16(~(this.b ^ this.a));
                break;
            case 22:  // Return from function (same as STOP but returns 0)
                this.running = false;
                break;
            case 23:  // SWITCH statement (jump table)
                {
                    // v = &m[pc]; b = *v++; pc = *v++;
                    let v = this.pc;
                    this.b = this.memory[v++];
                    this.pc = this.memory[v++];
                    // for (; b--; v += 2) if (a == v[0]) { pc = v[1]; goto fetch; }
                    let count = this.b;
                    while (count-- > 0) {
                        if (this.a === this.memory[v]) {
                            this.pc = this.memory[v + 1];
                            break;
                        }
                        v += 2;
                    }
                }
                break;
            default:
                throw new Error(`Unknown operator: ${op}`);
        }
    }
    
    // I/O Functions
    wrch(ch) {
        // Only write if outputting to current stream (cos = sysprint)
        if (this.cos === this.sysprint) {
            if (ch === 10) {  // LF
                this.outputBuffer.push('\n');
            } else {
                this.outputBuffer.push(String.fromCharCode(ch));
            }
        }
    }
    
    newline() {
        this.outputBuffer.push('\n');
    }
    
    writes(addr) {
        // BCPL string format: first byte is length
        const bytes = this.getBytes(addr);
        const len = bytes[0];
        for (let i = 1; i <= len; i++) {
            this.wrch(bytes[i]);
        }
    }
    
    writen(n) {
        this.writed(n, 0);
    }
    
    writed(n, width) {
        const str = n.toString();
        const padding = Math.max(0, width - str.length);
        this.outputBuffer.push(' '.repeat(padding) + str);
    }
    
    writef(argsAddr) {
        // Format string at memory[argsAddr], args follow
        const formatAddr = this.memory[argsAddr];
        const bytes = this.getBytes(formatAddr);
        const len = bytes[0];
        let argIndex = 1;
        
        for (let i = 1; i <= len; i++) {
            const ch = bytes[i];
            if (ch !== 37) {  // Not '%'
                this.wrch(ch);
            } else {
                // Format specifier
                i++;
                const spec = bytes[i];
                switch (spec) {
                    case 83:  // 'S' - string
                        this.writes(this.memory[argsAddr + argIndex++]);
                        break;
                    case 78:  // 'N' - number
                        this.writen(this.memory[argsAddr + argIndex++]);
                        break;
                    case 73:  // 'I' - integer with width
                        i++;
                        const width = bytes[i] - 48;  // '0'
                        this.writed(this.memory[argsAddr + argIndex++], width);
                        break;
                    case 67:  // 'C' - character
                        this.wrch(this.memory[argsAddr + argIndex++]);
                        break;
                    default:
                        this.wrch(spec);
                }
            }
        }
    }
    
    readn() {
        // Simple number reading from input buffer
        let sum = 0;
        let neg = false;
        
        while (this.inputPos < this.inputBuffer.length) {
            const ch = this.inputBuffer[this.inputPos++];
            if (ch === 45) {  // '-'
                neg = true;
            } else if (ch >= 48 && ch <= 57) {  // '0'-'9'
                sum = sum * 10 + (ch - 48);
            } else {
                break;
            }
        }
        
        return neg ? -sum : sum;
    }
    
    // Helper to get bytes from word memory
    getBytes(addr) {
        // BCPL strings: length byte followed by characters
        // Stored in word memory
        const bytes = [];
        let wordAddr = addr;
        let bytePos = 0;
        
        // Get up to 256 bytes (max string length)
        for (let i = 0; i < 256; i++) {
            const word = this.memory[wordAddr];
            const byte = (word >> (bytePos * 8)) & 0xFF;
            bytes.push(byte);
            
            if (i === 0 && byte === 0) break;  // Empty string
            if (i > 0 && i > bytes[0]) break;   // Past string length
            
            bytePos++;
            if (bytePos >= 2) {  // 2 bytes per word (16-bit)
                bytePos = 0;
                wordAddr++;
            }
        }
        
        return bytes;
    }
    
    // Get a single byte from memory
    getByteAt(addr, offset) {
        const wordAddr = addr + Math.floor(offset / 2);
        const bytePos = offset % 2;
        const word = this.memory[wordAddr];
        return (word >> (bytePos * 8)) & 0xFF;
    }
    
    // Set a single byte in memory
    setByteAt(addr, offset, value) {
        const wordAddr = addr + Math.floor(offset / 2);
        const bytePos = offset % 2;
        const word = this.memory[wordAddr];
        const mask = 0xFF << (bytePos * 8);
        this.memory[wordAddr] = (word & ~mask) | ((value & 0xFF) << (bytePos * 8));
    }
    
    // Additional I/O helpers
    rdch() {
        // Read character from input
        if (this.inputPos < this.inputBuffer.length) {
            return this.inputBuffer[this.inputPos++];
        }
        return -1; // ENDSTREAMCH
    }
    
    writehex(n, width) {
        const hex = (n >>> 0).toString(16).toUpperCase();
        const padded = hex.padStart(width, '0');
        this.outputBuffer.push(padded);
    }
    
    writeoct(n, width) {
        const oct = (n >>> 0).toString(8);
        const padded = oct.padStart(width, '0');
        this.outputBuffer.push(padded);
    }
}

// Export for use in main.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = IntcodeVM;
}
