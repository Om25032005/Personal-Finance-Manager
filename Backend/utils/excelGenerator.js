const ExcelJS = require('exceljs');

const generateExcelReport = async (incomes, expenses, monthName) => {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'Personal Finance Manager';
  workbook.lastModifiedBy = 'Personal Finance Manager';
  workbook.created = new Date();
  workbook.updated = new Date();

  // 1. SUMMARY SHEET
  const summarySheet = workbook.addWorksheet('Overview');
  
  // Style definitions
  const titleFill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFE0E7FF' } }; // Light Indigo
  const headerFill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF4F46E5' } }; // Indigo-600
  const headerFont = { name: 'Arial', size: 11, bold: true, color: { argb: 'FFFFFFFF' } };
  const currencyFormat = '$#,##0.00';

  // Add Title
  summarySheet.mergeCells('A1:D1');
  const titleCell = summarySheet.getCell('A1');
  titleCell.value = `Financial Overview - ${monthName}`;
  titleCell.font = { name: 'Arial', size: 16, bold: true, color: { argb: 'FF1E1B4B' } };
  titleCell.fill = titleFill;
  titleCell.alignment = { vertical: 'middle', horizontal: 'center' };
  summarySheet.getRow(1).height = 40;

  // Key stats
  const totalIncome = incomes.reduce((sum, inc) => sum + inc.amount, 0);
  const totalExpense = expenses.reduce((sum, exp) => sum + exp.amount, 0);
  const netSavings = totalIncome - totalExpense;
  const savingsRate = totalIncome > 0 ? (netSavings / totalIncome) : 0;

  summarySheet.addRow([]); // Blank
  summarySheet.addRow(['Key Metrics', 'Value']);
  summarySheet.addRow(['Total Income', totalIncome]);
  summarySheet.addRow(['Total Expense', totalExpense]);
  summarySheet.addRow(['Net Savings', netSavings]);
  summarySheet.addRow(['Savings Rate', savingsRate]);

  // Style Overview Table
  summarySheet.getRow(3).font = { bold: true };
  summarySheet.getColumn(1).width = 25;
  summarySheet.getColumn(2).width = 20;
  
  summarySheet.getCell('B4').numberFormat = currencyFormat;
  summarySheet.getCell('B5').numberFormat = currencyFormat;
  summarySheet.getCell('B6').numberFormat = currencyFormat;
  summarySheet.getCell('B7').numberFormat = '0.0%';

  // 2. INCOME SHEET
  const incomeSheet = workbook.addWorksheet('Income Details');
  incomeSheet.columns = [
    { header: 'Date', key: 'date', width: 15 },
    { header: 'Source', key: 'source', width: 25 },
    { header: 'Description', key: 'description', width: 35 },
    { header: 'Amount', key: 'amount', width: 20 }
  ];

  // Style Header
  incomeSheet.getRow(1).height = 25;
  incomeSheet.getRow(1).eachCell((cell) => {
    cell.fill = headerFill;
    cell.font = headerFont;
    cell.alignment = { vertical: 'middle', horizontal: 'center' };
  });

  incomes.forEach((inc) => {
    const row = incomeSheet.addRow({
      date: new Date(inc.date).toLocaleDateString(),
      source: inc.source,
      description: inc.description || '-',
      amount: inc.amount
    });
    row.getCell('amount').numberFormat = currencyFormat;
  });

  // 3. EXPENSE SHEET
  const expenseSheet = workbook.addWorksheet('Expense Details');
  expenseSheet.columns = [
    { header: 'Date', key: 'date', width: 15 },
    { header: 'Category', key: 'category', width: 25 },
    { header: 'Description', key: 'description', width: 35 },
    { header: 'Amount', key: 'amount', width: 20 }
  ];

  expenseSheet.getRow(1).height = 25;
  expenseSheet.getRow(1).eachCell((cell) => {
    cell.fill = headerFill;
    cell.font = headerFont;
    cell.alignment = { vertical: 'middle', horizontal: 'center' };
  });

  expenses.forEach((exp) => {
    const row = expenseSheet.addRow({
      date: new Date(exp.date).toLocaleDateString(),
      category: exp.category,
      description: exp.description || '-',
      amount: exp.amount
    });
    row.getCell('amount').numberFormat = currencyFormat;
  });

  return workbook;
};

module.exports = { generateExcelReport };
