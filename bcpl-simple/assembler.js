// INTCODE Assembler - converts text INTCODE to binary
class IntcodeAssembler {
    constructor() {
        this.reset();
    }
    
    reset() {
        this.memory = new Array(20000).fill(0);
        this.labels = new Array(10000).fill(0);  // Support up to 10000 labels
        this.lomem = 401;
        this.pos = 0;
        this.input = '';
    }
    
    assemble(text, startAddress = 401) {
        this.reset();
        this.lomem = startAddress;
        
        // Remove line continuation markers (/)
        this.input = text.replace(/\/\s*\n/g, '').trim();
        this.pos = 0;
        
        this.skipWhitespace();
        
        while (this.pos < this.input.length) {
            const ch = this.input[this.pos];
            
            if (ch === 'Z') {
                // End of code
                this.pos++;
                break;
            } else if (ch === '$') {
                // Label definition: $ 123
                this.pos++;
                this.skipWhitespace();
                const labelNum = this.readNumber();
                this.defineLabel(labelNum, this.lomem);
                this.skipWhitespace();
            } else if (ch === 'L' || ch === 'S' || ch === 'A' || ch === 'J' || 
                       ch === 'T' || ch === 'F' || ch === 'K' || ch === 'X') {
                // Instruction
                this.parseInstruction();
                this.skipWhitespace();
            } else if (ch === 'G') {
                // Global directive: GL123 or G456
                this.pos++;
                if (this.input[this.pos] === 'L') {
                    this.pos++;
                }
                this.skipWhitespace();
                this.readNumber(); // Skip the number
                this.skipWhitespace();
            } else {
                this.pos++;
            }
        }
        
        // Resolve forward references
        this.resolveLabels();
        
        return this.memory.slice(startAddress, this.lomem);
    }
    
    parseInstruction() {
        const startPos = this.pos;
        const opChar = this.input[this.pos++];
        
        let op, f = 0, d = 0;
        
        // Determine base opcode
        switch (opChar) {
            case 'L': op = 0; break;
            case 'S': op = 1; break;
            case 'A': op = 2; break;
            case 'J': op = 3; break;
            case 'T': op = 4; break;
            case 'F': op = 5; break;
            case 'K': op = 6; break;
            case 'X': op = 7; break;
            default:
                throw new Error(`Unknown opcode: ${opChar} at position ${startPos}`);
        }
        
        // Check for modifier
        const nextCh = this.input[this.pos];
        
        if (opChar === 'L' && nextCh === 'L') {
            op = 11;
            this.pos++;
        } else if (opChar === 'S' && nextCh === 'S') {
            op = 12;
            this.pos++;
        } else if (opChar === 'A' && nextCh === 'A') {
            op = 13;
            this.pos++;
        } else if (opChar === 'L' && /[IPGL]/.test(nextCh)) {
            f = this.parseFlag();
        } else if (opChar === 'S' && /[PGL]/.test(nextCh)) {
            f = this.parseFlag();
        } else if (opChar === 'A' && /[IPG]/.test(nextCh)) {
            f = this.parseFlag();
        }
        
        this.skipWhitespace();
        
        // Parse operand
        if (this.pos < this.input.length && this.input[this.pos] === 'L') {
            // Label reference
            this.pos++;
            const labelNum = this.readNumber();
            this.addLabelRef(labelNum, this.lomem);
            d = 0; // Will be filled in later
        } else if (this.pos < this.input.length && /[0-9-]/.test(this.input[this.pos])) {
            // Numeric operand
            d = this.readNumber();
        }
        
        const instr = op | (f << 4) | (d << 7);
        this.memory[this.lomem++] = instr;
    }
    
    parseFlag() {
        const ch = this.input[this.pos++];
        switch (ch) {
            case 'P': return 1;
            case 'G': return 2;
            case 'I': 
                if (this.input[this.pos] === 'P') {
                    this.pos++;
                    return 3;
                }
                if (this.input[this.pos] === 'G') {
                    this.pos++;
                    return 4;
                }
                return 0;
            case 'L':
                if (this.input[this.pos] === 'P') {
                    this.pos++;
                    return 5;
                }
                if (this.input[this.pos] === 'G') {
                    this.pos++;
                    return 6;
                }
                return 0;
            default:
                return 0;
        }
    }
    
    defineLabel(num, addr) {
        if (num < 0 || num >= this.labels.length) {
            throw new Error(`Label ${num} out of range`);
        }
        
        if (this.labels[num] < 0) {
            // Already defined - resolve forward references
            let k = -this.labels[num];
            while (k > 0) {
                const next = this.memory[k];
                this.memory[k] = addr;
                k = next;
            }
        }
        
        this.labels[num] = -addr;
    }
    
    addLabelRef(num, addr) {
        if (num < 0 || num >= this.labels.length) {
            throw new Error(`Label ${num} out of range`);
        }
        
        const k = this.labels[num];
        if (k < 0) {
            // Label already defined
            const instr = this.memory[addr];
            this.memory[addr] = (instr & 0x7F) | ((-k) << 7);
        } else {
            // Forward reference
            this.memory[addr] = k;
            this.labels[num] = addr;
        }
    }
    
    resolveLabels() {
        // Check for unresolved labels
        for (let i = 0; i < this.labels.length; i++) {
            if (this.labels[i] > 0) {
                console.warn(`Warning: Label ${i} not defined`);
            }
        }
    }
    
    readNumber() {
        let num = 0;
        let negative = false;
        
        if (this.input[this.pos] === '-') {
            negative = true;
            this.pos++;
        }
        
        while (this.pos < this.input.length && /[0-9]/.test(this.input[this.pos])) {
            num = num * 10 + (this.input.charCodeAt(this.pos) - 48);
            this.pos++;
        }
        
        return negative ? -num : num;
    }
    
    skipWhitespace() {
        while (this.pos < this.input.length && /\s/.test(this.input[this.pos])) {
            this.pos++;
        }
    }
}
