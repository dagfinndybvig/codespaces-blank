// INTCODE Assembler - matching icint.c implementation
// VERSION 5 - Label stack size 10000
console.log('IntcodeAssembler2.js VERSION 5 loaded - label stack size: 10000');

class IntcodeAssembler {
    constructor() {
        this.memory = new Array(19900).fill(0);
        
        // Initialize global area (0-400) with identity values like icint.c
        for (let i = 0; i < 401; i++) {
            this.memory[i] = i;
        }
        
        this.lomem = 401;  // PROGSTART
        this.labels = {};  // label name -> address
        this.labelValueStack = new Array(10000).fill(0);  // label number -> address or chain (large enough for syni+trni)
        console.log(`IntcodeAssembler constructor: labelValueStack.length = ${this.labelValueStack.length}`);
        this.ch = '';
        this.input = '';
        this.pos = 0;
    }
    
    rch() {
        // Read next character
        if (this.pos < this.input.length) {
            this.ch = this.input[this.pos++];
        } else {
            this.ch = '\0';  // End of stream
            return;
        }
        
        // Handle line continuation with '/'
        while (this.ch === '/') {
            // Skip to end of line (handle both \r and \n)
            while (this.ch !== '\n' && this.ch !== '\r' && this.ch !== '\0') {
                if (this.pos < this.input.length) {
                    this.ch = this.input[this.pos++];
                } else {
                    this.ch = '\0';
                    return;
                }
            }
            // Skip all newline characters (\r and \n in any combination)
            while (this.ch === '\n' || this.ch === '\r') {
                if (this.pos < this.input.length) {
                    this.ch = this.input[this.pos++];
                } else {
                    this.ch = '\0';
                    return;
                }
            }
        }
    }
    
    rdn() {
        // Read a decimal number
        let n = 0;
        let negative = false;
        
        if (this.ch === '-') {
            negative = true;
            this.rch();
        }
        
        while (this.ch >= '0' && this.ch <= '9') {
            n = n * 10 + (this.ch.charCodeAt(0) - '0'.charCodeAt(0));
            this.rch();
        }
        
        return negative ? -n : n;
    }
    
    stw(word) {
        if (this.lomem >= this.memory.length) {
            throw new Error(`Memory overflow: lomem=${this.lomem} exceeds memory size ${this.memory.length}`);
        }
        if (typeof word !== 'number' || isNaN(word)) {
            throw new Error(`Invalid word value: ${word} (type: ${typeof word})`);
        }
        this.memory[this.lomem++] = word;
    }
    
    labref(labelNum, addr) {
        // Add label reference to chain
        if (labelNum < 0 || labelNum >= this.labelValueStack.length) {
            console.error('Label stack length:', this.labelValueStack.length);
            throw new Error(`Label number ${labelNum} out of range (max ${this.labelValueStack.length - 1})`);
        }
        const k = this.labelValueStack[labelNum];
        if (k < 0) {
            // Label already defined, store its address
            this.memory[addr] = -k;
        } else {
            // Add to forward reference chain
            this.memory[addr] = k;
            this.labelValueStack[labelNum] = addr;
        }
    }
    
    // Parse INTCODE text format
    parse(text) {
        // Clean up text - handle line continuations
        text = text.replace(/\/\s*\n/g, ' ');
        this.input = text;
        this.pos = 0;
        this.lomem = 401;
        this.labels = {};
        this.labelValueStack = new Array(10000).fill(0);  // Reset with large enough size for syni+trni
        
        console.log(`Parsing ${text.length} characters of INTCODE`);
        console.log(`*** PARSE METHOD: labelValueStack size = ${this.labelValueStack.length} ***`);
        console.log(`First 200 chars: ${text.substring(0, 200)}`);
        
        // Add startup code like icint.c init() does
        // This calls START (global 1) to begin execution
        this.stw(8 | (1 << 8));     // F0_L | FI_BIT | (K01_START << FN_BITS) = Load indirect from global 1
        this.stw(6 | (2 << 8));     // F6_K | (2 << FN_BITS) = Call with 2 args
        this.stw(7 | (22 << 8));    // F7_X | (22 << FN_BITS) = Execute with 22 (return/exit)
        
        this.assemble();
        
        console.log(`Generated ${this.lomem - 401} words of code`);
        console.log(`Labels defined:`, Object.keys(this.labels).length);
        console.log(`First 30 words:`, this.memory.slice(401, 431));
        
        // Validate lomem before slicing
        if (this.lomem < 0 || this.lomem > this.memory.length) {
            throw new Error(`Invalid lomem value: ${this.lomem} (must be between 0 and ${this.memory.length})`);
        }
        
        return this.memory.slice(0, this.lomem);
    }
    
    assemble() {
        try {
            while (true) {
                this.rch();
                
                // Skip whitespace, $ separator, and control chars (but NOT '/' which is handled in rch())
                while (this.ch === ' ' || this.ch === '\n' || this.ch === '\r' || 
                       this.ch === '\t' || this.ch === '$') {
                    this.rch();
                }
                
                // Check for label definition (number at start)
                if (this.ch >= '0' && this.ch <= '9') {
                    const labelNum = this.rdn();
                    const currentAddr = this.lomem;
                    
                    if (this.lomem < 450) {  // Only log first few labels
                        console.log(`Label ${labelNum} defined at ${currentAddr}`);
                    }
                    
                    // Validate label number
                    if (labelNum < 0 || labelNum >= this.labelValueStack.length) {
                        throw new Error(`Label number ${labelNum} out of range (max ${this.labelValueStack.length - 1}) at position ${this.pos}`);
                    }
                    
                    // Check for duplicate label (warn but continue)
                    if (this.labelValueStack[labelNum] < 0) {
                        console.warn(`Warning: Duplicate label ${labelNum} (was ${-this.labelValueStack[labelNum]}, now ${currentAddr})`);
                    }
                    
                    // Resolve forward references
                    let k = this.labelValueStack[labelNum];
                    while (k > 0) {
                        const tmp = this.memory[k];
                        this.memory[k] = currentAddr;
                        k = tmp;
                    }
                    
                    // Mark label as defined (negative means defined)
                    this.labels[`L${labelNum}`] = currentAddr;
                    this.labelValueStack[labelNum] = -currentAddr;
                    continue;
                }
            
            // End of stream
            if (this.ch === '\0') {
                console.log(`End of stream reached at position ${this.pos}, lomem=${this.lomem}`);
                break;
            }
            
            // Parse instruction
            let opcode = 0;
            let instrStart = this.pos - 1;
            
            // Debug: show what we're parsing
            if (this.lomem < 425) {
                console.log(`  Parsing at lomem=${this.lomem}, ch='${this.ch}' (${this.ch.charCodeAt(0)})`);
            }
            
            switch (this.ch) {
                case 'L': opcode = 0; break;  // F0_L (Load)
                case 'S': opcode = 1; break;  // F1_S (Store)
                case 'A': opcode = 2; break;  // F2_A (Add)
                case 'J': opcode = 3; break;  // F3_J (Jump)
                case 'T': opcode = 4; break;  // F4_T (True jump)
                case 'F': opcode = 5; break;  // F5_F (False jump)
                case 'K': opcode = 6; break;  // F6_K (Call)
                case 'X': opcode = 7; break;  // F7_X (Execute)
                case 'C':  // Character data
                    this.rch();
                    this.stw(this.rdn());
                    continue;
                case 'D':  // Data word
                    this.rch();
                    if (this.ch === 'L') {
                        this.rch();
                        this.stw(0);
                        this.labref(this.rdn(), this.lomem - 1);
                    } else {
                        this.stw(this.rdn());
                    }
                    continue;
                case 'G':  // Global variable definition
                    this.rch();
                    const globalNum = this.rdn();
                    if (this.ch === 'L') {
                        this.rch();
                        const labelNum = this.rdn();
                        this.memory[globalNum] = 0;
                        this.labref(labelNum, globalNum);
                    } else {
                        console.error('Expected L after G in global definition');
                    }
                    continue;
                case 'Z':  // Clear labels (restart)
                    this.labelValueStack = new Array(500).fill(0);
                    this.labels = {};
                    continue;
                default:
                    if (this.ch !== '\0') {
                        console.warn(`Unknown character '${this.ch}' (${this.ch.charCodeAt(0)}) at position ${this.pos}`);
                    }
                    continue;
            }
            
            // Read flags and operand
            this.rch();
            let flags = 0;
            let isGlobal = false;
            
            if (this.ch === 'I') {
                flags |= (1 << 3);  // FI_BIT (Indirect)
                this.rch();
            }
            
            if (this.ch === 'P') {
                flags |= (1 << 4);  // FP_BIT (P-relative)
                this.rch();
            }
            
            if (this.ch === 'G') {
                // Global flag - operand is a global number
                isGlobal = true;
                this.rch();
            }
            
            if (this.ch === 'L') {
                // Label operand
                this.rch();
                const labelNum = this.rdn();
                const addr = this.lomem;
                this.stw(opcode | flags | (1 << 5));  // FD_BIT
                this.stw(0);
                this.labref(labelNum, this.lomem - 1);
                if (this.lomem < 420) {
                    console.log(`  -> At ${addr}: Opcode=${opcode}, flags=${flags}, label=L${labelNum}`);
                }
            } else {
                // Numeric operand
                const operand = this.rdn();
                
                if (operand >= 0 && operand <= 255 && operand >= -128 && !isGlobal) {
                    // Fits in instruction word (8 bits)
                    const addr = this.lomem;
                    this.stw(opcode | flags | (operand << 8));
                    if (this.lomem < 420) {
                        console.log(`  -> At ${addr}: Opcode=${opcode}, flags=${flags}, operand=${operand}, word=${opcode | flags | (operand << 8)}`);
                    }
                } else {
                    // Needs separate data word (large number or global)
                    const addr = this.lomem;
                    this.stw(opcode | flags | (1 << 5));  // FD_BIT
                    this.stw(operand);
                    if (this.lomem < 420) {
                        console.log(`  -> At ${addr}: Opcode=${opcode}, flags=${flags}, operand=${operand}${isGlobal ? ' (global)' : ''} (2 words)`);
                    }
                }
            }
        }
        
        // Check for unresolved labels
        for (let i = 0; i < this.labelValueStack.length; i++) {
            if (this.labelValueStack[i] > 0) {
                console.warn(`Unresolved label ${i}`);
            }
        }
        } catch (error) {
            console.error('Error during assembly:', error);
            console.error('Assembly state:', {
                lomem: this.lomem,
                pos: this.pos,
                ch: this.ch,
                inputLength: this.input.length
            });
            throw error;
        }
    }
}
