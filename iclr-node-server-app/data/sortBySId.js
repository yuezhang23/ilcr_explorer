import fs from 'fs';

// Function to read and parse JSONL file
function readJsonlFile(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');
    return content.trim().split('\n').map(line => JSON.parse(line));
}

// Function to write records to JSONL file
function writeJsonlFile(filePath, records) {
    const content = records.map(record => JSON.stringify(record)).join('\n');
    fs.writeFileSync(filePath, content);
}

// Function to sort records by s_id
function sortBySId(records) {
    return records.sort((a, b) => {
        if (a.s_id < b.s_id) return -1;
        if (a.s_id > b.s_id) return 1;
        return 0;
    });
}

// Main function
function main() {
    try {
        // Sort no_rebut file
        console.log('Sorting result_no_rebut.jsonl...');
        const noRebuttalRecords = readJsonlFile('result_rebut.jsonl');
        const sortedNoRebuttal = sortBySId(noRebuttalRecords);
        writeJsonlFile('result_no_rebut_sorted.jsonl', sortedNoRebuttal);
        console.log(`Sorted ${noRebuttalRecords.length} records from no_rebut file`);
        
        // Sort rebut file
        console.log('Sorting result_rebut.jsonl...');
        const rebuttalRecords = readJsonlFile('result_rebut.jsonl');
        const sortedRebuttal = sortBySId(rebuttalRecords);
        writeJsonlFile('result_rebut_sorted.jsonl', sortedRebuttal);
        console.log(`Sorted ${rebuttalRecords.length} records from rebut file`);
        
        // Show first few sorted records from each file
        console.log('\nFirst 5 sorted records from no_rebut:');
        sortedNoRebuttal.slice(0, 5).forEach((record, index) => {
            console.log(`${index + 1}. s_id: ${record.s_id}, prompt: ${record.prompt}, rebuttal: ${record.rebuttal}`);
        });
        
        console.log('\nFirst 5 sorted records from rebut:');
        sortedRebuttal.slice(0, 5).forEach((record, index) => {
            console.log(`${index + 1}. s_id: ${record.s_id}, prompt: ${record.prompt}, rebuttal: ${record.rebuttal}`);
        });
        
        console.log('\nSorting completed! Files saved as:');
        console.log('- result_no_rebut_sorted.jsonl');
        console.log('- result_rebut_sorted.jsonl');
        
    } catch (error) {
        console.error('Error:', error.message);
    }
}

// Run the script
main(); 