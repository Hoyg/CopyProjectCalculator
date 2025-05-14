const XLSX = require("xlsx");

try {
    const workbook = XLSX.readFile("Questions.xlsx");
    const sheet_name_list = workbook.SheetNames;
    const sheet = workbook.Sheets[sheet_name_list[0]];
    const data = XLSX.utils.sheet_to_json(sheet, {header: 1});
    console.log(JSON.stringify(data, null, 2));
} catch (error) {
    console.error("Error reading Excel file:", error);
}
