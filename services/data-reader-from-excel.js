const fs = require("fs");
const ExcelJS = require("exceljs");

async function readExcelFile(filePath) {
    try {
      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.readFile(filePath);
  
      const worksheet = workbook.getWorksheet(1); // Get the first worksheet
      const data = [];
  
      worksheet.eachRow((row, rowNumber) => {
        if (rowNumber > 1) {
          const topicValue = row.getCell(1).value ? row.getCell(1).value.trim() : ''; // Trim any leading or trailing spaces
          const rowData = {
            topic: topicValue,
            values: row.getCell(2).value.split(";").map(value => value.trim().toLowerCase()), // Split values by semicolon and trim whitespace
          };
          data.push(rowData);
        }
      });
  
      return data;
    } catch (error) {
      console.error("Error reading Excel file:", error);
      return [];
    }
  }

async function processData() {
  const filePath = "dataset/Data.xlsx"; // Update with the path to your Excel file
  const data = await readExcelFile(filePath);

  // Save data to a JSON file
  const jsonFilePath = "dataset/model-data/pre-processed-data-from-excel.json"; // Update with the desired output file path
  fs.writeFile(jsonFilePath, JSON.stringify(data, null, 2), (err) => {
    if (err) {
      console.error("Error writing JSON file:", err);
    } else {
      console.log("JSON file generated successfully.");
    }
  });
}

module.exports = { processData }