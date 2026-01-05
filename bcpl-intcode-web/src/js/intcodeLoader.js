// INTCODE File Loader
// Loads compiled INTCODE files (binary or text format)

class IntcodeLoader {
    constructor() {
        this.data = [];
        this.assembler = new IntcodeAssembler();
    }
    
    // Load from file (auto-detect format)
    async loadFromFile(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            
            reader.onload = (e) => {
                const content = e.target.result;
                
                try {
                    // Try to detect if it's text or binary
                    const text = new TextDecoder().decode(content);
                    
                    // If it contains INTCODE mnemonics, it's text format
                    if (text.match(/[LSAJTFKX][IGP]?\d+/)) {
                        console.log('Detected text INTCODE format');
                        this.data = this.assembler.parse(text);
                        console.log(`Assembled ${this.data.length} words of INTCODE`);
                        console.log('First 20 words:', this.data.slice(0, 20));
                        resolve(this.data);
                    } else {
                        // Try binary format
                        const dataView = new DataView(content);
                        const words = [];
                        
                        for (let i = 0; i < content.byteLength; i += 2) {
                            if (i + 1 < content.byteLength) {
                                words.push(dataView.getInt16(i, true));
                            }
                        }
                        
                        this.data = words;
                        resolve(words);
                    }
                } catch (error) {
                    reject(new Error('Failed to parse INTCODE file: ' + error.message));
                }
            };
            
            reader.onerror = () => reject(new Error('Failed to read file'));
            reader.readAsArrayBuffer(file);
        });
    }
    
    // Load from text format directly
    loadFromText(text) {
        this.data = this.assembler.parse(text);
        return this.data;
    }
    
    getData() {
        return this.data;
    }
}

if (typeof module !== 'undefined' && module.exports) {
    module.exports = IntcodeLoader;
}
