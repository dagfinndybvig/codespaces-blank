// BCPL Compiler Controller
// Orchestrates the three-stage compilation pipeline

class BCPLCompiler {
    constructor() {
        this.vm = new IntcodeVM();
        this.assembler = new IntcodeAssembler();
        this.compilerLoaded = false;
        this.syniTriniCode = null;
        this.cgiCode = null;
        this.compiledIntcode = null;
    }

    async loadCompilers() {
        try {
            // Load all three compiler stages
            const [syniText, trniText, cgiText] = await Promise.all([
                fetch('compiler/syni').then(r => r.text()),
                fetch('compiler/trni').then(r => r.text()),
                fetch('compiler/cgi').then(r => r.text())
            ]);

            // Parse syni+trni together (concatenate the INTCODE text before parsing)
            // This is how icint.c does it - multiple ICFILE loads assemble into same memory
            const syniTriniText = syniText + '\n' + trniText;
            this.syniTriniCode = this.assembler.parse(syniTriniText);
            this.cgiCode = this.assembler.parse(cgiText);

            this.compilerLoaded = true;
            console.log('Compilers loaded:', {
                'syni+trni': this.syniTriniCode.length,
                cgi: this.cgiCode.length
            });

            return true;
        } catch (error) {
            console.error('Failed to load compilers:', error);
            throw new Error('Failed to load compiler components: ' + error.message);
        }
    }

    // Run a single compilation stage
    async runStage(stageCode, input) {
        console.log(`Running stage with input length: ${input.length}`);
        console.log(`Input preview: ${input.substring(0, 200)}`);
        
        // Create fresh VM for each stage
        this.vm = new IntcodeVM();
        
        // Load the stage code into VM
        this.vm.loadIntcode(stageCode);
        
        // Set input buffer (convert string to byte array)
        this.vm.inputBuffer = [];
        for (let i = 0; i < input.length; i++) {
            this.vm.inputBuffer.push(input.charCodeAt(i));
        }
        // Note: rdch() will return -1 (ENDSTREAMCH) when buffer is exhausted
        this.vm.inputPos = 0;
        
        console.log(`Input buffer set: ${this.vm.inputBuffer.length} bytes`);

        // Run the VM
        const result = this.vm.run();
        
        console.log(`Stage result:`, {
            success: result.success,
            outputLength: result.output ? result.output.length : 0,
            error: result.error
        });
        console.log(`Output preview: ${result.output ? result.output.substring(0, 200) : 'none'}`);
        
        if (!result.success) {
            throw new Error('Compilation stage failed: ' + result.error);
        }
        
        if (!result.output || result.output.length === 0) {
            throw new Error('Compilation stage produced no output');
        }

        return result.output;
    }

    async compile(sourceCode) {
        if (!this.compilerLoaded) {
            await this.loadCompilers();
        }

        const stages = [];

        // Stage 1 & 2: Syntax analyzer + Translator (syni + trni loaded together)
        console.log('Stage 1&2: Running syni+trni...');
        const ocode = await this.runStage(this.syniTriniCode, sourceCode);
        console.log('syni+trni output length:', ocode ? ocode.length : 0);
        stages.push({ name: 'syni+trni', output: ocode });

        if (!ocode || ocode.length === 0) {
            throw new Error('syni+trni stage produced no output');
        }

        // Stage 3: Code generator (cgi)
        console.log('Stage 3: Running cgi...');
        const ocode2 = await this.runStage(this.cgiCode, ocode);
        stages.push({ name: 'cgi', output: ocode2 });
        console.log('cgi output length:', ocode2.length);

        this.compiledIntcode = ocode2;

        return {
            success: true,
            intcode: ocode2,
            stages: stages
        };
    }

    async compileAndRun(sourceCode) {
        // First compile
        const compileResult = await this.compile(sourceCode);
        
        if (!compileResult.success) {
            return compileResult;
        }

        // Then parse and run the generated INTCODE
        console.log('Parsing generated INTCODE...');
        const code = this.assembler.parse(compileResult.intcode);
        
        console.log('Running compiled program...');
        this.vm.loadIntcode(code);
        const runResult = this.vm.run();

        return {
            success: runResult.success,
            compileOutput: compileResult,
            runOutput: runResult.output,
            error: runResult.error
        };
    }
}

// UI Controller
document.addEventListener('DOMContentLoaded', () => {
    console.log('Compiler page loaded');
    
    const compiler = new BCPLCompiler();
    console.log('BCPLCompiler instance created');
    
    const fileInput = document.getElementById('fileInput');
    const sourceEditor = document.getElementById('sourceEditor');
    const outputArea = document.getElementById('outputArea');
    const compileButton = document.getElementById('compileButton');
    const compileRunButton = document.getElementById('compileRunButton');
    const downloadButton = document.getElementById('downloadIntcodeButton');
    const clearButton = document.getElementById('clearButton');
    const progress = document.getElementById('progress');

    console.log('All elements found:', {
        fileInput: !!fileInput,
        sourceEditor: !!sourceEditor,
        outputArea: !!outputArea,
        compileButton: !!compileButton,
        compileRunButton: !!compileRunButton,
        downloadButton: !!downloadButton,
        clearButton: !!clearButton,
        progress: !!progress
    });

    // Load file
    fileInput.addEventListener('change', async (event) => {
        const file = event.target.files[0];
        if (file) {
            try {
                const text = await file.text();
                sourceEditor.value = text;
                outputArea.value = `Loaded: ${file.name}\n`;
            } catch (error) {
                outputArea.value = `Error loading file: ${error.message}\n`;
            }
        }
    });

    // Update progress
    function updateProgress(step, status) {
        const stepEl = document.getElementById(`step${step}`);
        stepEl.className = 'step ' + status;
        
        if (status === 'active') {
            stepEl.textContent = stepEl.textContent.replace('⏳', '⚙️');
        } else if (status === 'done') {
            stepEl.textContent = stepEl.textContent.replace('⏳', '✅').replace('⚙️', '✅');
        } else if (status === 'error') {
            stepEl.textContent = stepEl.textContent.replace('⏳', '❌').replace('⚙️', '❌');
        }
    }

    function resetProgress() {
        progress.classList.remove('active');
        for (let i = 1; i <= 5; i++) {
            const stepEl = document.getElementById(`step${i}`);
            stepEl.className = 'step';
            stepEl.textContent = stepEl.textContent.replace(/[✅❌⚙️]/g, '⏳');
        }
    }

    // Compile only
    compileButton.addEventListener('click', async () => {
        console.log('Compile button clicked');
        const source = sourceEditor.value.trim();
        if (!source) {
            outputArea.value = 'Error: No source code to compile\n';
            return;
        }

        try {
            resetProgress();
            progress.classList.add('active');
            outputArea.value = 'Starting compilation...\n\n';

            // Step 1: Load compilers
            updateProgress(1, 'active');
            outputArea.value += '⚙️ Loading compilers...\n';
            await compiler.loadCompilers();
            updateProgress(1, 'done');
            outputArea.value += '✅ Compilers loaded\n\n';

            // Step 2: Run syni
            updateProgress(2, 'active');
            outputArea.value += '⚙️ Stage 1: Syntax analysis...\n';
            const result = await compiler.compile(source);
            updateProgress(2, 'done');
            outputArea.value += '✅ Syntax analysis complete\n\n';

            // Step 3: Run trni
            updateProgress(3, 'active');
            outputArea.value += '⚙️ Stage 2: Translation...\n';
            updateProgress(3, 'done');
            outputArea.value += '✅ Translation complete\n\n';

            // Step 4: Run cgi
            updateProgress(4, 'active');
            outputArea.value += '⚙️ Stage 3: Code generation...\n';
            updateProgress(4, 'done');
            outputArea.value += '✅ Code generation complete\n\n';

            // Step 5: Done
            updateProgress(5, 'done');
            outputArea.value += '━━━━━━━━━━━━━━━━━━━━━━\n';
            outputArea.value += '🎉 Compilation successful!\n\n';
            outputArea.value += `Generated INTCODE (${result.intcode.length} bytes)\n`;
            outputArea.value += '━━━━━━━━━━━━━━━━━━━━━━\n\n';
            outputArea.value += result.intcode.substring(0, 500) + '\n...\n';

            downloadButton.disabled = false;

        } catch (error) {
            outputArea.value += '\n❌ Compilation failed:\n' + error.message + '\n';
            console.error('Compilation error:', error);
            
            // Mark current step as error
            for (let i = 1; i <= 5; i++) {
                const stepEl = document.getElementById(`step${i}`);
                if (stepEl.classList.contains('active')) {
                    updateProgress(i, 'error');
                }
            }
        }
    });

    // Compile and run
    compileRunButton.addEventListener('click', async () => {
        const source = sourceEditor.value.trim();
        if (!source) {
            outputArea.value = 'Error: No source code to compile\n';
            return;
        }

        try {
            resetProgress();
            progress.classList.add('active');
            outputArea.value = 'Starting compilation...\n\n';

            // Load compilers
            updateProgress(1, 'active');
            await compiler.loadCompilers();
            updateProgress(1, 'done');

            // Compile
            updateProgress(2, 'active');
            outputArea.value += '⚙️ Compiling...\n';
            
            const result = await compiler.compileAndRun(source);
            
            updateProgress(2, 'done');
            updateProgress(3, 'done');
            updateProgress(4, 'done');
            updateProgress(5, 'done');

            if (result.success) {
                outputArea.value += '✅ Compilation successful!\n\n';
                outputArea.value += '━━━━━━━━━━━━━━━━━━━━━━\n';
                outputArea.value += 'Program Output:\n';
                outputArea.value += '━━━━━━━━━━━━━━━━━━━━━━\n\n';
                outputArea.value += result.runOutput;
                
                downloadButton.disabled = false;
            } else {
                outputArea.value += '\n❌ Error: ' + result.error + '\n';
            }

        } catch (error) {
            outputArea.value += '\n❌ Error:\n' + error.message + '\n';
            console.error('Error:', error);
            
            for (let i = 1; i <= 5; i++) {
                const stepEl = document.getElementById(`step${i}`);
                if (stepEl.classList.contains('active')) {
                    updateProgress(i, 'error');
                }
            }
        }
    });

    // Download INTCODE
    downloadButton.addEventListener('click', () => {
        if (!compiler.compiledIntcode) {
            alert('No compiled INTCODE to download');
            return;
        }

        const blob = new Blob([compiler.compiledIntcode], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'compiled.intcode';
        a.click();
        URL.revokeObjectURL(url);
    });

    // Clear
    clearButton.addEventListener('click', () => {
        if (confirm('Clear source code and output?')) {
            sourceEditor.value = '';
            outputArea.value = '';
            downloadButton.disabled = true;
            resetProgress();
        }
    });
});
