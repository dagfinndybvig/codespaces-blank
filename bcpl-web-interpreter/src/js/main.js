// Main application controller for BCPL Web Interpreter
// Coordinates UI, file handling, and interpreter execution

document.addEventListener('DOMContentLoaded', () => {
    // Initialize components
    const interpreter = new BCPLInterpreter();
    const fileHandler = new FileHandler();

    // UI Elements
    const fileInput = document.getElementById('fileInput');
    const codeEditor = document.getElementById('codeEditor');
    const runButton = document.getElementById('runButton');
    const clearButton = document.getElementById('clearButton');
    const downloadButton = document.getElementById('downloadButton');
    const outputArea = document.getElementById('output');
    const fileNameDisplay = document.getElementById('fileName');
    const exampleSelect = document.getElementById('exampleSelect');
    const loadExampleButton = document.getElementById('loadExampleButton');

    // File upload handler
    if (fileInput) {
        fileInput.addEventListener('change', async (event) => {
            const file = event.target.files[0];
            if (file) {
                try {
                    const result = await fileHandler.loadFromFile(file);
                    codeEditor.value = result.code;
                    updateFileName(result.fileName);
                    showMessage('File loaded successfully!', 'success');
                } catch (error) {
                    showMessage('Error: ' + error.message, 'error');
                }
            }
        });
    }

    // Load example handler
    if (loadExampleButton) {
        loadExampleButton.addEventListener('click', async () => {
            const exampleName = exampleSelect.value;
            if (exampleName) {
                try {
                    const result = await fileHandler.loadExample(exampleName);
                    codeEditor.value = result.code;
                    updateFileName(result.fileName);
                    showMessage('Example loaded successfully!', 'success');
                } catch (error) {
                    showMessage('Error: ' + error.message, 'error');
                }
            }
        });
    }

    // Run button handler
    if (runButton) {
        runButton.addEventListener('click', () => {
            const code = codeEditor.value.trim();
            
            if (!code) {
                showMessage('Please enter or load BCPL code first!', 'error');
                return;
            }

            // Update file handler with current code
            fileHandler.setCode(code);

            // Clear previous output
            outputArea.textContent = 'Running...\n';
            
            // Run the interpreter
            try {
                const result = interpreter.run(code);
                
                if (result.success) {
                    outputArea.textContent = result.output || '(Program completed with no output)';
                    outputArea.classList.remove('error');
                    outputArea.classList.add('success');
                    showMessage('Execution completed successfully!', 'success');
                } else {
                    outputArea.textContent = 'Error: ' + result.error + '\n\nOutput so far:\n' + result.output;
                    outputArea.classList.remove('success');
                    outputArea.classList.add('error');
                    showMessage('Execution failed: ' + result.error, 'error');
                }
            } catch (error) {
                outputArea.textContent = 'Fatal error: ' + error.message;
                outputArea.classList.remove('success');
                outputArea.classList.add('error');
                showMessage('Fatal error: ' + error.message, 'error');
            }
        });
    }

    // Clear button handler
    if (clearButton) {
        clearButton.addEventListener('click', () => {
            if (confirm('Are you sure you want to clear the editor?')) {
                codeEditor.value = '';
                outputArea.textContent = '';
                fileInput.value = '';
                updateFileName('');
                showMessage('Editor cleared', 'success');
            }
        });
    }

    // Download button handler
    if (downloadButton) {
        downloadButton.addEventListener('click', () => {
            const code = codeEditor.value;
            if (!code.trim()) {
                showMessage('No code to download!', 'error');
                return;
            }
            const fileName = fileHandler.getCurrentFileName();
            fileHandler.downloadCode(code, fileName);
            showMessage('File downloaded!', 'success');
        });
    }

    // Helper functions
    function updateFileName(name) {
        if (fileNameDisplay) {
            fileNameDisplay.textContent = name || 'No file loaded';
        }
    }

    function showMessage(message, type) {
        // Create message element
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${type}`;
        messageDiv.textContent = message;
        
        // Find or create message container
        let container = document.getElementById('messageContainer');
        if (!container) {
            container = document.createElement('div');
            container.id = 'messageContainer';
            document.querySelector('.container').prepend(container);
        }
        
        container.appendChild(messageDiv);
        
        // Remove after 3 seconds
        setTimeout(() => {
            messageDiv.remove();
        }, 3000);
    }

    // Load default example on startup
    if (codeEditor && !codeEditor.value.trim()) {
        codeEditor.value = `GET "LIBHDR"

LET START() BE $(
  WRITES("Hello, BCPL World!*N")
  WRITES("This is a simple BCPL program.*N")
$)`;
        updateFileName('example.b');
    }

    console.log('BCPL Web Interpreter initialized successfully');
});