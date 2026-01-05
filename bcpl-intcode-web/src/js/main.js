// Main application controller

document.addEventListener('DOMContentLoaded', () => {
    const vm = new IntcodeVM();
    const loader = new IntcodeLoader();
    
    // UI elements
    const fileInput = document.getElementById('fileInput');
    const runButton = document.getElementById('runButton');
    const outputArea = document.getElementById('output');
    const statusDiv = document.getElementById('status');
    
    let intcodeLoaded = false;
    
    // File upload handler
    fileInput.addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        
        try {
            statusDiv.textContent = 'Loading INTCODE file...';
            statusDiv.className = 'status info';
            
            const data = await loader.loadFromFile(file);
            vm.loadIntcode(data);
            intcodeLoaded = true;
            
            statusDiv.textContent = `Loaded ${data.length} words of INTCODE`;
            statusDiv.className = 'status success';
            runButton.disabled = false;
        } catch (error) {
            statusDiv.textContent = 'Error loading file: ' + error.message;
            statusDiv.className = 'status error';
        }
    });
    
    // Run button handler
    runButton.addEventListener('click', () => {
        if (!intcodeLoaded) {
            statusDiv.textContent = 'Please load an INTCODE file first';
            statusDiv.className = 'status error';
            return;
        }
        
        outputArea.textContent = 'Running...\\n';
        statusDiv.textContent = 'Executing program...';
        statusDiv.className = 'status info';
        
        // Run VM with slight delay to show status
        setTimeout(() => {
            try {
                const result = vm.run();
                
                if (result.success) {
                    outputArea.textContent = result.output || '(Program completed with no output)';
                    statusDiv.textContent = 'Execution completed successfully';
                    statusDiv.className = 'status success';
                } else {
                    outputArea.textContent = 'Error: ' + result.error + '\\n\\nOutput:\\n' + result.output;
                    statusDiv.textContent = 'Execution failed';
                    statusDiv.className = 'status error';
                }
            } catch (error) {
                outputArea.textContent = 'Fatal error: ' + error.message;
                statusDiv.textContent = 'Fatal error occurred';
                statusDiv.className = 'status error';
            }
        }, 50);
    });
    
    // Initialize
    runButton.disabled = true;
    statusDiv.textContent = 'Load an INTCODE file to begin';
    statusDiv.className = 'status info';
    
    console.log('BCPL INTCODE VM initialized');
});
