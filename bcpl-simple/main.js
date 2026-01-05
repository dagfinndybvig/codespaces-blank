// Main application logic
let compiler = new BCPLCompiler();
let compiledCode = null;

const sourceCode = document.getElementById('sourceCode');
const output = document.getElementById('output');
const log = document.getElementById('log');
const status = document.getElementById('status');
const compileBtn = document.getElementById('compileBtn');
const runBtn = document.getElementById('runBtn');
const clearBtn = document.getElementById('clearBtn');

function setStatus(message, type = 'info') {
    status.textContent = message;
    status.className = `status ${type}`;
}

function appendLog(message) {
    log.textContent += message;
    log.scrollTop = log.scrollHeight;
}

function appendOutput(message) {
    output.textContent += message;
    output.scrollTop = output.scrollHeight;
}

function clearOutput() {
    output.textContent = '';
}

function clearLog() {
    log.textContent = '';
}

// Load compilers on page load
setStatus('Loading compilers...', 'info');
compiler.loadCompilers()
    .then(() => {
        setStatus('Ready to compile', 'success');
        compileBtn.disabled = false;
        appendLog('Compilers loaded successfully.\n');
        appendLog('Ready to compile BCPL code.\n\n');
    })
    .catch(error => {
        setStatus(`Failed to load compilers: ${error.message}`, 'error');
        appendLog(`Error loading compilers: ${error.message}\n`);
    });

compileBtn.addEventListener('click', async () => {
    clearLog();
    clearOutput();
    compiledCode = null;
    runBtn.disabled = true;
    
    const source = sourceCode.value;
    
    if (!source.trim()) {
        setStatus('No source code to compile', 'error');
        return;
    }
    
    setStatus('Compiling...', 'info');
    compileBtn.disabled = true;
    
    try {
        compiledCode = await compiler.compile(source, appendLog);
        setStatus('Compilation successful! Click Run to execute.', 'success');
        runBtn.disabled = false;
    } catch (error) {
        setStatus(`Compilation failed: ${error.message}`, 'error');
        compiledCode = null;
    } finally {
        compileBtn.disabled = false;
    }
});

runBtn.addEventListener('click', async () => {
    if (!compiledCode) {
        setStatus('No compiled code to run', 'error');
        return;
    }
    
    clearOutput();
    setStatus('Running program...', 'info');
    runBtn.disabled = true;
    
    try {
        await compiler.run(compiledCode, appendOutput);
        setStatus('Program completed successfully', 'success');
    } catch (error) {
        setStatus(`Runtime error: ${error.message}`, 'error');
    } finally {
        runBtn.disabled = false;
    }
});

clearBtn.addEventListener('click', () => {
    clearOutput();
    clearLog();
    compiledCode = null;
    runBtn.disabled = true;
    setStatus('Ready to compile', 'info');
});
