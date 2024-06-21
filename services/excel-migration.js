const fs = require('fs');
const ExcelJS = require('exceljs');

async function processTextFiles(file1Path, file2Path, outputPath) {
    try {
        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Data');

        // Add column headers
        worksheet.columns = [
            { header: 'Value', key: 'value' },
            { header: 'Topic', key: 'topic' }
        ];

        // Function to add rows to the worksheet
        const addRowsToWorksheet = (rows) => {
            rows.forEach(row => {
                worksheet.addRow(row);
            });
        };

        // Read data from both files simultaneously using streams
        const file1Stream = fs.createReadStream(file1Path, { encoding: 'utf-8' });
        const file2Stream = fs.createReadStream(file2Path, { encoding: 'utf-8' });

        let file1Data = [];
        let file2Data = [];

        // Process file 1 data
        file1Stream.on('data', chunk => {
            file1Data.push(chunk);
        });

        file1Stream.on('end', () => {
            file1Data = file1Data.join('').split('\n').map(line => {
                return { value: line.trim(), topic: '' };
            });
            addRowsToWorksheet(file1Data);

            // Process file 2 data
            file2Stream.on('data', chunk => {
                file2Data.push(chunk);
            });

            file2Stream.on('end', () => {
                file2Data = file2Data.join('').split('\n').map(line => {
                    return { value: '', topic: line.trim() };
                });
                addRowsToWorksheet(file2Data);

                // Write data to the output Excel file
                workbook.xlsx.writeFile(outputPath)
                    .then(() => {
                        console.log('Excel file generated successfully.');
                    })
                    .catch(error => {
                        console.error('Error writing Excel file:', error);
                    });
            });
        });
    } catch (error) {
        console.error('Error processing text files:', error);
    }
}

// Example usage:
const file1Path = "classifier/dataset/preprocessed_nb_abstracts.csv";
const file2Path = "classifier/dataset/topics.csv";
const outputPath = 'classifier/dataset/combined.xlsx';

async function run() {
    await processTextFiles(file1Path, file2Path, outputPath);
}

module.exports = { run };
