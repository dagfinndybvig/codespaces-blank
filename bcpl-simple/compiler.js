// BCPL Compiler - coordinates the compilation pipeline
class BCPLCompiler {
    constructor() {
        this.syni = null;
        this.trni = null;
        this.cgi = null;
        this.vm = new IntcodeVM();
        this.assembler = new IntcodeAssembler();
    }
    
    async loadCompilers() {
        const responses = await Promise.all([
            fetch('../bcpl-intcode-web/src/compiler/syni'),
            fetch('../bcpl-intcode-web/src/compiler/trni'),
            fetch('../bcpl-intcode-web/src/compiler/cgi')
        ]);
        
        const [syniText, trniText, cgiText] = await Promise.all(
            responses.map(r => r.text())
        );
        
        // Assemble the compilers
        this.syni = this.assembler.assemble(syniText);
        this.trni = this.assembler.assemble(trniText);
        this.cgi = this.assembler.assemble(cgiText);
        
        // Combine syni and trni
        this.syniTrni = [...this.syni, ...this.trni];
        
        return true;
    }
    
    async compile(sourceCode, log) {
        log('Starting compilation...\n');
        
        // Stage 1: Run SYNI+TRNI to produce intermediate INTCODE
        log('Stage 1: Running SYNI+TRNI parser/translator...\n');
        log(`Input: ${sourceCode.length} characters\n`);
        
        try {
            this.vm = new IntcodeVM();
            this.vm.setInput(sourceCode);  // Set source code as input
            this.vm.load(this.syniTrni, 401);
            
            // Set up the VM environment for the compiler
            // The compilers expect specific memory layout
            this.vm.g = 200;  // Global pointer
            this.vm.st = 400; // Stack pointer
            
            // Add progress reporting
            this.vm.progressCallback = (count) => {
                log(`  ... ${(count / 1000000).toFixed(1)}M instructions ...\n`);
            };
            
            const result1 = await this.vm.run();
            log(`SYNI+TRNI: ${this.vm.instructionCount.toLocaleString()} instructions, ${result1.length} chars output\n`);
            
            if (result1.length === 0) {
                throw new Error('SYNI+TRNI produced no output');
            }
            
            // Stage 2: Run CGI to produce final INTCODE
            log('\nStage 2: Running CGI code generator...\n');
            this.vm = new IntcodeVM();
            this.vm.setInput(result1);  // Feed stage 1 output to CGI
            this.vm.load(this.cgi, 401);
            this.vm.g = 200;
            this.vm.st = 400;
            
            // Add progress reporting
            this.vm.progressCallback = (count) => {
                log(`  ... ${(count / 1000000).toFixed(1)}M instructions ...\n`);
            };
            
            const result2 = await this.vm.run();
            log(`CGI: ${this.vm.instructionCount.toLocaleString()} instructions, ${result2.length} chars output\n`);
            
            if (result2.length === 0) {
                throw new Error('CGI produced no output');
            }
            
            // Stage 3: Assemble final INTCODE
            log('\nStage 3: Assembling final INTCODE...\n');
            const finalCode = this.assembler.assemble(result2);
            log(`Final code: ${finalCode.length} words\n`);
            log('\n✓ Compilation successful!\n');
            
            return finalCode;
            
        } catch (error) {
            log(`\n✗ Compilation failed: ${error.message}\n`);
            if (error.stack) {
                log(`Stack: ${error.stack}\n`);
            }
            throw error;
        }
    }
    
    async run(code, output) {
        output('Running program...\n');
        output('─'.repeat(40) + '\n');
        
        this.vm = new IntcodeVM();
        this.vm.load(code, 401);
        
        try {
            const result = await this.vm.run();
            output(result);
            output('\n' + '─'.repeat(40) + '\n');
            output(`\nProgram finished (${this.vm.instructionCount} instructions)\n`);
            return true;
        } catch (error) {
            output(`\n✗ Runtime error: ${error.message}\n`);
            throw error;
        }
    }
    
    encodeSource(text) {
        const bytes = [];
        for (let i = 0; i < text.length; i++) {
            bytes.push(text.charCodeAt(i));
        }
        return bytes;
    }
}
