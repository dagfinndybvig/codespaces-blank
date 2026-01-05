// INTCODE Assembler - Converts text INTCODE to binary
// Parses the symbolic INTCODE format into executable bytecode

class IntcodeAssembler {
    constructor() {
        this.labels = {};
        this.code = [];
        this.pc = 401;  // PROGSTART
        
        // Instruction mnemonics to opcodes
        this.opcodes = {
            'L': 0,   // Load
            'S': 1,   // Store
            'A': 2,   // Add
            'J': 3,   // Jump
            'T': 4,   // Test (jump if true)
            'F': 5,   // False (jump if false)
            'K': 6,   // Call
            'X': 7    // Execute
        };
        
        this.FN_BITS = 8;
        this.FI_BIT = (1 << 3);
        this.FP_BIT = (1 << 4);
        this.FD_BIT = (1 << 5);
    }
    
    // Parse INTCODE text format
    parse(text) {
        // Clean up text
        text = text.replace(/\r/g, '');
        
        // Split into tokens
        const tokens = this.tokenize(text);
        console.log(`Tokenized ${tokens.length} tokens`);
        console.log('First 50 tokens:', tokens.slice(0, 50));
        
        // First pass: collect labels
        this.firstPass(tokens);
        console.log('Labels found:', this.labels);
        
        // Second pass: generate code
        this.secondPass(tokens);
        console.log(`Generated ${this.code.length} words of code`);
        
        return this.code;
    }
    
    tokenize(text) {
        const tokens = [];
        let current = '';
        let inComment = false;
        
        for (let i = 0; i < text.length; i++) {
            const ch = text[i];
            
            if (ch === '$') {
                // Toggle comment mode
                inComment = !inComment;
                if (current) {
                    tokens.push(current);
                    current = '';
                }
                continue;
            }
            
            if (inComment) {
                continue; // Skip comment content
            }
            
            if (ch === ' ' || ch === '\n' || ch === '\t' || ch === '/') {
                if (current) {
                    tokens.push(current);
                    current = '';
                }
            } else {
                current += ch;
            }
        }
        
        if (current && !inComment) tokens.push(current);
        
        return tokens;
    }
    
    firstPass(tokens) {
        let pc = 401;
        
        for (let i = 0; i < tokens.length; i++) {
            const token = tokens[i];
            
            // Label definition (e.g., "L7", "L123")
            if (token.match(/^[A-Z]\d+$/)) {
                // Check if next token is an instruction
                if (i + 1 < tokens.length && this.isInstruction(tokens[i + 1])) {
                    this.labels[token] = pc;
                }
            }
            
            // Count instruction words
            if (this.isInstruction(token)) {
                pc++; // Base instruction
                
                // Check for D modifier (data word follows)
                if (token.startsWith('D')) {
                    pc++;
                } else if (token.match(/[LSAJTFKX][IG]/)) {
                    // G modifier might need extra word
                    if (i + 1 < tokens.length) {
                        const arg = tokens[i + 1];
                        if (this.isLargeNumber(arg)) {
                            pc++;
                        }
                    }
                }
            }
        }
    }
    
    secondPass(tokens) {
        this.code = [];
        let i = 0;
        
        while (i < tokens.length) {
            const token = tokens[i];
            
            // Skip labels (they're just markers)
            if (token.match(/^[A-Z]\d+$/) && i + 1 < tokens.length && this.isInstruction(tokens[i + 1])) {
                i++;
                continue;
            }
            
            // Process instructions
            if (token.startsWith('D')) {
                // Data directive
                i++;
                if (i < tokens.length) {
                    const value = this.parseValue(tokens[i]);
                    this.code.push(value);
                }
                i++;
            } else if (this.isInstruction(token)) {
                i = this.encodeInstruction(token, tokens, i);
            } else {
                i++;
            }
        }
    }
    
    isInstruction(token) {
        if (!token) return false;
        return token.match(/^[LSAJTFKX][LGPI]?\d*$/) !== null || token.startsWith('D');
    }
    
    isLargeNumber(str) {
        const num = this.parseValue(str);
        return num < -128 || num > 255;
    }
    
    encodeInstruction(inst, tokens, index) {
        let opcode = 0;
        let flags = 0;
        let operand = 0;
        let hasInlineOperand = false;
        
        // Parse instruction
        const baseOp = inst[0];
        let pos = 1;
        
        // Parse modifiers
        while (pos < inst.length && !this.isDigit(inst[pos])) {
            const modifier = inst[pos];
            if (modifier === 'I') {
                flags |= this.FI_BIT;
            } else if (modifier === 'P') {
                flags |= this.FP_BIT;
            } else if (modifier === 'G' || modifier === 'L') {
                // Addressing modes - handled by operand
            }
            pos++;
        }
        
        // Get operand if embedded in instruction
        if (pos < inst.length) {
            operand = parseInt(inst.substring(pos));
            hasInlineOperand = true;
        } else if (index + 1 < tokens.length && !this.isInstruction(tokens[index + 1])) {
            // Next token is the operand
            operand = this.parseValue(tokens[index + 1]);
        }
        
        // Get opcode
        opcode = this.opcodes[baseOp] || 0;
        
        // Encode instruction
        let word = opcode | flags;
        
        // Check if operand fits in instruction word (8 bits)
        if (operand >= 0 && operand < 256) {
            word |= (operand << this.FN_BITS);
            this.code.push(word);
        } else {
            // Need data word
            word |= this.FD_BIT;
            this.code.push(word);
            this.code.push(operand & 0xFFFF);
        }
        
        // Return next index
        return hasInlineOperand ? index + 1 : index + 2;
    }
    
    isDigit(ch) {
        return ch >= '0' && ch <= '9';
    }
    
    parseValue(str) {
        if (!str) return 0;
        
        // Label reference
        if (str.match(/^[A-Z]\d+$/)) {
            return this.labels[str] || 0;
        }
        
        // Negative number
        if (str.startsWith('-')) {
            return -parseInt(str.substring(1));
        }
        
        // Hex
        if (str.startsWith('#')) {
            return parseInt(str.substring(1), 16);
        }
        
        // Regular number
        return parseInt(str) || 0;
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = IntcodeAssembler;
}
