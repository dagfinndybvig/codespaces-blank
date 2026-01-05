// File Handler for BCPL Web Interpreter
// Handles file upload, loading examples, and code input

class FileHandler {
    constructor() {
        this.currentCode = '';
        this.currentFileName = '';
    }

    // Load code from file input
    loadFromFile(file) {
        return new Promise((resolve, reject) => {
            if (!file) {
                reject(new Error('No file provided'));
                return;
            }

            if (!file.name.endsWith('.b')) {
                reject(new Error('Please select a BCPL file (.b extension)'));
                return;
            }

            const reader = new FileReader();
            
            reader.onload = (e) => {
                this.currentCode = e.target.result;
                this.currentFileName = file.name;
                resolve({
                    code: this.currentCode,
                    fileName: this.currentFileName
                });
            };

            reader.onerror = (e) => {
                reject(new Error('Failed to read file: ' + e.target.error));
            };

            reader.readAsText(file);
        });
    }

    // Load example file
    async loadExample(exampleName) {
        try {
            const response = await fetch(`../examples/${exampleName}.b`);
            if (!response.ok) {
                throw new Error(`Failed to load example: ${exampleName}`);
            }
            this.currentCode = await response.text();
            this.currentFileName = `${exampleName}.b`;
            return {
                code: this.currentCode,
                fileName: this.currentFileName
            };
        } catch (error) {
            throw new Error(`Error loading example: ${error.message}`);
        }
    }

    // Get current code
    getCurrentCode() {
        return this.currentCode;
    }

    // Set code directly (from textarea)
    setCode(code) {
        this.currentCode = code;
    }

    // Get current filename
    getCurrentFileName() {
        return this.currentFileName || 'untitled.b';
    }

    // Download current code as file
    downloadCode(code, filename) {
        const blob = new Blob([code], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = filename || 'program.b';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
}

// Export for use in main.js
if (typeof module !== 'undefined' && module.exports) {
    module.exports = FileHandler;
}