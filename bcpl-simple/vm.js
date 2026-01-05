// Simple INTCODE Virtual Machine
class IntcodeVM {
    constructor(memorySize = 20000) {
        this.memory = new Array(memorySize).fill(0);
        this.pc = 0;
        this.a = 0;
        this.b = 0;
        this.c = 0;
        this.p = 0;
        this.g = 0;
        this.st = 0;
        this.output = [];
        this.input = [];
        this.inputPos = 0;
        this.halted = false;
        this.instructionCount = 0;
        this.maxInstructions = 100000000;  // 100M instructions for compilation
        this.progressCallback = null;
        this.progressInterval = 1000000;  // Report every 1M instructions
    }
    
    setInput(text) {
        this.input = [];
        for (let i = 0; i < text.length; i++) {
            this.input.push(text.charCodeAt(i));
        }
        this.inputPos = 0;
    }
    
    load(code, startAddress = 401) {
        for (let i = 0; i < code.length; i++) {
            this.memory[startAddress + i] = code[i];
        }
        this.pc = startAddress;
        this.p = startAddress - 1;
        this.g = 200;
        this.st = startAddress - 1;
    }
    
    async run() {
        this.halted = false;
        this.instructionCount = 0;
        let lastProgress = 0;
        let lastYield = 0;
        
        while (!this.halted && this.instructionCount < this.maxInstructions) {
            this.step();
            this.instructionCount++;
            
            // Report progress
            if (this.progressCallback && 
                this.instructionCount - lastProgress >= this.progressInterval) {
                this.progressCallback(this.instructionCount);
                lastProgress = this.instructionCount;
            }
            
            // Yield to browser every 100K instructions to prevent freezing
            if (this.instructionCount - lastYield >= 100000) {
                await new Promise(resolve => setTimeout(resolve, 0));
                lastYield = this.instructionCount;
            }
        }
        
        if (this.instructionCount >= this.maxInstructions) {
            throw new Error(`Maximum instruction count exceeded (${this.maxInstructions.toLocaleString()})`);
        }
        
        return this.output.join('');
    }
    
    step() {
        const instr = this.memory[this.pc++];
        const op = instr & 15;
        const f = (instr >> 4) & 7;
        const d = instr >> 7;
        
        let addr;
        switch (f) {
            case 0: addr = d; break;
            case 1: addr = this.p + d; break;
            case 2: addr = this.g + d; break;
            case 3: addr = this.memory[this.p + d]; break;
            case 4: addr = this.memory[this.g + d]; break;
            case 5: addr = this.memory[this.memory[this.p + d]]; break;
            case 6: addr = this.memory[this.memory[this.g + d]]; break;
            default: addr = 0;
        }
        
        switch (op) {
            case 0:  // L - Load
                this.a = this.memory[addr];
                break;
            case 1:  // S - Store
                this.memory[addr] = this.a;
                break;
            case 2:  // A - Add
                this.a += this.memory[addr];
                break;
            case 3:  // J - Jump
                this.pc = addr;
                break;
            case 4:  // T - Test and jump
                if (this.a) this.pc = addr;
                break;
            case 5:  // F - Test false and jump
                if (!this.a) this.pc = addr;
                break;
            case 6:  // K - Load constant
                this.a = d;
                break;
            case 7:  // X - Execute operation
                this.executeOp(d);
                break;
            case 8:  // L1 - Load via P
                this.a = this.memory[this.p + d];
                break;
            case 9:  // S1 - Store via P
                this.memory[this.p + d] = this.a;
                break;
            case 10: // A1 - Add via P
                this.a += this.memory[this.p + d];
                break;
            case 11: // LL - Load local
                this.a = this.memory[this.memory[this.p + d]];
                break;
            case 12: // SS - Store local
                this.memory[this.memory[this.p + d]] = this.a;
                break;
            case 13: // AA - Add local
                this.a += this.memory[this.memory[this.p + d]];
                break;
            default:
                throw new Error(`Unknown opcode: ${op}`);
        }
    }
    
    executeOp(op) {
        switch (op) {
            case 0:  // NOP or undefined - just continue
                break;
            case 1:  // NEG
                this.a = -this.a;
                break;
            case 2:  // NOT
                this.a = ~this.a;
                break;
            case 3:  // SUB
                this.b = this.memory[--this.st];
                this.a = this.b - this.a;
                break;
            case 4:  // MUL
                this.b = this.memory[--this.st];
                this.a = (this.b * this.a) | 0;
                break;
            case 5:  // DIV
                this.b = this.memory[--this.st];
                this.a = Math.floor(this.b / this.a);
                break;
            case 6:  // REM
                this.b = this.memory[--this.st];
                this.a = this.b % this.a;
                break;
            case 7:  // LSH
                this.b = this.memory[--this.st];
                this.a = this.b << this.a;
                break;
            case 8:  // RSH
                this.b = this.memory[--this.st];
                this.a = this.b >> this.a;
                break;
            case 9:  // AND
                this.b = this.memory[--this.st];
                this.a = this.b & this.a;
                break;
            case 10: // OR
                this.b = this.memory[--this.st];
                this.a = this.b | this.a;
                break;
            case 11: // XOR
                this.b = this.memory[--this.st];
                this.a = this.b ^ this.a;
                break;
            case 12: // EQ
                this.b = this.memory[--this.st];
                this.a = (this.b === this.a) ? -1 : 0;
                break;
            case 13: // NE
                this.b = this.memory[--this.st];
                this.a = (this.b !== this.a) ? -1 : 0;
                break;
            case 14: // LS
                this.b = this.memory[--this.st];
                this.a = (this.b < this.a) ? -1 : 0;
                break;
            case 15: // GR
                this.b = this.memory[--this.st];
                this.a = (this.b > this.a) ? -1 : 0;
                break;
            case 16: // LE
                this.b = this.memory[--this.st];
                this.a = (this.b <= this.a) ? -1 : 0;
                break;
            case 17: // GE
                this.b = this.memory[--this.st];
                this.a = (this.b >= this.a) ? -1 : 0;
                break;
            case 18: // STACK
                this.memory[++this.st] = this.a;
                break;
            case 19: // CALL
                this.memory[++this.st] = this.p;
                this.memory[++this.st] = this.pc;
                this.p = this.st;
                this.pc = this.a;
                break;
            case 20: // RTN
                this.pc = this.memory[this.p];
                this.st = this.p - 1;
                this.p = this.memory[this.p - 1];
                break;
            case 21: // FINISH
                this.halted = true;
                break;
            case 22: // WRCH - Write character
                this.output.push(String.fromCharCode(this.a & 0xFF));
                break;
            case 23: // RDCH - Read character
                if (this.inputPos < this.input.length) {
                    this.a = this.input[this.inputPos++];
                } else {
                    this.a = -1;  // EOF
                }
                break;
            default:
                // For unknown operations, just log and continue
                console.warn(`Unknown X operation: ${op} - treating as NOP`);
                break;
        }
    }
}
