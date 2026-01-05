// BCPL Web Interpreter - Core Interpreter Logic
// This is a simplified BCPL interpreter that runs directly in JavaScript

class BCPLInterpreter {
    constructor() {
        this.output = [];
        this.globals = {};
        this.memory = new Array(10000).fill(0);
        this.stack = [];
        this.functions = {};
        this.setupBuiltins();
    }

    setupBuiltins() {
        // Built-in BCPL functions
        this.builtins = {
            WRITES: (str) => {
                this.output.push(str);
                return str.length;
            },
            WRITEF: (format, ...args) => {
                let result = this.formatString(format, args);
                this.output.push(result);
                return result.length;
            },
            WRITEN: (n) => {
                this.output.push(n.toString());
                return n.toString().length;
            },
            WRCH: (ch) => {
                this.output.push(String.fromCharCode(ch));
                return 1;
            },
            NEWLINE: () => {
                this.output.push('\n');
                return 1;
            }
        };
    }

    formatString(format, args) {
        let result = format;
        let argIndex = 0;
        
        // Replace BCPL format specifiers
        result = result.replace(/\*N/g, '\n');
        result = result.replace(/\*T/g, '\t');
        result = result.replace(/\*S/g, ' ');
        
        // Handle %I and %N format specifiers
        result = result.replace(/%I\d*/g, (match) => {
            if (argIndex < args.length) {
                return args[argIndex++].toString();
            }
            return match;
        });
        
        result = result.replace(/%N/g, (match) => {
            if (argIndex < args.length) {
                return args[argIndex++].toString();
            }
            return match;
        });
        
        return result;
    }

    parse(code) {
        // Simple BCPL parser
        const ast = {
            type: 'PROGRAM',
            globals: {},
            functions: []
        };

        // Remove comments
        code = code.replace(/\/\/.*$/gm, '');
        
        // Extract GET statements (library includes)
        const getMatches = code.match(/GET\s+"([^"]+)"/g);
        if (getMatches) {
            ast.includes = getMatches.map(g => g.match(/"([^"]+)"/)[1]);
        }

        // Extract GLOBAL declarations
        const globalMatch = code.match(/GLOBAL\s+\$\(([\s\S]*?)\$\)/);
        if (globalMatch) {
            const globalDecls = globalMatch[1];
            const globals = globalDecls.match(/(\w+)\s*:\s*(\d+)/g);
            if (globals) {
                globals.forEach(decl => {
                    const [name, addr] = decl.split(':').map(s => s.trim());
                    ast.globals[name] = parseInt(addr);
                });
            }
        }

        // Extract function definitions (LET/AND)
        const funcRegex = /LET\s+(\w+)\s*\((.*?)\)\s*(?:BE|=)\s*(?:\$\([\s\S]*?\$\)|VALOF\s*\$\([\s\S]*?\$\)|[^$]*)/g;
        let match;
        while ((match = funcRegex.exec(code)) !== null) {
            ast.functions.push({
                name: match[1],
                params: match[2].split(',').map(p => p.trim()).filter(p => p),
                body: match[0]
            });
        }

        return ast;
    }

    run(code) {
        try {
            this.output = [];
            const ast = this.parse(code);
            
            // Register global variables
            Object.assign(this.globals, ast.globals);

            // Find and execute START function
            const startFunc = ast.functions.find(f => f.name === 'START');
            if (startFunc) {
                this.executeFunction(startFunc, code);
            } else {
                throw new Error('No START() function found');
            }

            return {
                success: true,
                output: this.output.join('')
            };
        } catch (error) {
            return {
                success: false,
                output: this.output.join(''),
                error: error.message
            };
        }
    }

    executeFunction(func, fullCode) {
        // Find the function start
        const funcStart = fullCode.match(new RegExp(`LET\\s+${func.name}\\s*\\([^)]*\\)\\s*(?:BE|=)\\s*\\$\\(`));
        
        if (!funcStart) {
            throw new Error(`Could not find body for function ${func.name}`);
        }

        // Find the matching $) by counting depth
        const startPos = funcStart.index + funcStart[0].length;
        let depth = 1;
        let endPos = startPos;
        
        while (depth > 0 && endPos < fullCode.length) {
            if (fullCode.substring(endPos, endPos + 2) === '$(') {
                depth++;
                endPos += 2;
            } else if (fullCode.substring(endPos, endPos + 2) === '$)') {
                depth--;
                if (depth === 0) break;
                endPos += 2;
            } else {
                endPos++;
            }
        }

        const body = fullCode.substring(funcStart.index, endPos + 2);
        
        // Execute statements in the body
        this.executeBlock(body);
    }

    executeBlock(block) {
        // Extract statements between $( and $)
        const stmtMatch = block.match(/\$\(([\s\S]*?)\$\)/);
        if (!stmtMatch) {
            return;
        }

        const statements = stmtMatch[1];
        
        // Process statements sequentially
        this.executeStatements(statements);
    }

    executeStatements(statements) {
        // Find and execute FOR loops first
        const forRegex = /FOR\s+(\w+)\s*=\s*([^T]+?)\s+TO\s+([^D]+?)\s+DO\s+\$\(/;
        const forMatch = forRegex.exec(statements);
        
        if (forMatch) {
            const beforeLoop = statements.substring(0, forMatch.index);
            const varName = forMatch[1];
            const start = this.evaluateExpression(forMatch[2].trim());
            const end = this.evaluateExpression(forMatch[3].trim());
            
            // Find matching $) for the loop body
            const startPos = forMatch.index + forMatch[0].length;
            let depth = 1;
            let endPos = startPos;
            
            while (depth > 0 && endPos < statements.length) {
                if (statements.substring(endPos, endPos + 2) === '$(') {
                    depth++;
                    endPos += 2;
                } else if (statements.substring(endPos, endPos + 2) === '$)') {
                    depth--;
                    if (depth === 0) break;
                    endPos += 2;
                } else {
                    endPos++;
                }
            }
            
            const loopBody = statements.substring(startPos, endPos);
            const afterLoop = statements.substring(endPos + 2);
            
            // Execute statements before loop
            this.executeSimpleStatements(beforeLoop);
            
            // Execute the loop
            for (let i = start; i <= end; i++) {
                this.globals[varName] = i;
                this.executeStatements(loopBody);
            }
            
            // Execute statements after loop
            this.executeStatements(afterLoop);
        } else {
            // No FOR loop, just execute simple statements
            this.executeSimpleStatements(statements);
        }
    }

    executeSimpleStatements(statements) {
        // Handle WRITES calls
        const writesRegex = /WRITES\s*\(\s*"([^"]*)"\s*\)/g;
        let match;
        while ((match = writesRegex.exec(statements)) !== null) {
            let str = match[1];
            // Handle BCPL escape sequences
            str = str.replace(/\*N/g, '\n');
            str = str.replace(/\*T/g, '\t');
            str = str.replace(/\*S/g, ' ');
            this.builtins.WRITES(str);
        }

        // Handle WRITEF calls
        const writefRegex = /WRITEF\s*\(\s*"([^"]*)"(?:\s*,\s*([^)]+))?\s*\)/g;
        while ((match = writefRegex.exec(statements)) !== null) {
            let format = match[1];
            let args = match[2] ? match[2].split(',').map(a => this.evaluateExpression(a.trim())) : [];
            this.builtins.WRITEF(format, ...args);
        }

        // Handle variable assignments
        const assignRegex = /(\w+)\s*:=\s*([^$\n;]+)/g;
        while ((match = assignRegex.exec(statements)) !== null) {
            const varName = match[1];
            const value = this.evaluateExpression(match[2].trim());
            this.globals[varName] = value;
        }
    }

    evaluateExpression(expr) {
        expr = expr.trim();
        
        // Check if it's a number
        if (/^\d+$/.test(expr)) {
            return parseInt(expr);
        }
        
        // Check if it's a variable
        if (/^\w+$/.test(expr) && this.globals[expr] !== undefined) {
            return this.globals[expr];
        }
        
        // Handle arithmetic expressions
        try {
            // Simple evaluation for basic arithmetic
            const code = expr.replace(/(\w+)/g, (match) => {
                if (this.globals[match] !== undefined) {
                    return this.globals[match];
                }
                return match;
            });
            return eval(code);
        } catch (e) {
            return 0;
        }
    }
}

// Export for use in main.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = BCPLInterpreter;
}