const PDFDocument = require('pdfkit');

const generatePDFReport = (incomes, expenses, monthName, user, res) => {
  const doc = new PDFDocument({ margin: 50, size: 'A4' });

  // Stream directly to response
  doc.pipe(res);

  // Colors
  const primaryColor = '#4f46e5'; // Indigo
  const darkTextColor = '#1e293b';
  const lightTextColor = '#64748b';
  const borderBgColor = '#f1f5f9';

  // 1. HEADER
  doc
    .fillColor(primaryColor)
    .font('Helvetica-Bold')
    .fontSize(22)
    .text('Personal Finance Manager', 50, 50);

  doc
    .fillColor(lightTextColor)
    .font('Helvetica')
    .fontSize(10)
    .text(`Report Period: ${monthName}`, 50, 75)
    .text(`Generated For: ${user.name} (${user.email})`, 50, 90)
    .text(`Date: ${new Date().toLocaleDateString()}`, 50, 105, { align: 'right' });

  doc.moveDown(2);
  doc.strokeColor('#e2e8f0').lineWidth(1).moveTo(50, 125).lineTo(545, 125).stroke();

  // 2. FINANCIAL SUMMARY CARDS
  const totalIncome = incomes.reduce((sum, inc) => sum + inc.amount, 0);
  const totalExpense = expenses.reduce((sum, exp) => sum + exp.amount, 0);
  const netSavings = totalIncome - totalExpense;
  const savingsRate = totalIncome > 0 ? (netSavings / totalIncome) * 100 : 0;

  doc.moveDown(1.5);
  doc
    .fillColor(darkTextColor)
    .font('Helvetica-Bold')
    .fontSize(14)
    .text('Financial Summary', 50, 145);

  // Cards layout: 3 columns
  const cardWidth = 150;
  const cardHeight = 65;
  const startY = 170;

  // Income Card
  doc.rect(50, startY, cardWidth, cardHeight).fill(borderBgColor);
  doc.fillColor('#065f46').font('Helvetica-Bold').fontSize(10).text('TOTAL INCOME', 60, startY + 15);
  doc.fillColor('#047857').fontSize(16).text(`$${totalIncome.toFixed(2)}`, 60, startY + 35);

  // Expense Card
  doc.rect(215, startY, cardWidth, cardHeight).fill(borderBgColor);
  doc.fillColor('#991b1b').font('Helvetica-Bold').fontSize(10).text('TOTAL EXPENSE', 225, startY + 15);
  doc.fillColor('#b91c1c').fontSize(16).text(`$${totalExpense.toFixed(2)}`, 225, startY + 35);

  // Savings Card
  doc.rect(380, startY, cardWidth, cardHeight).fill(borderBgColor);
  const savingsColor = netSavings >= 0 ? '#1e40af' : '#b91c1c';
  doc.fillColor(savingsColor).font('Helvetica-Bold').fontSize(10).text('NET SAVINGS', 390, startY + 15);
  doc.fillColor(savingsColor).fontSize(16).text(`$${netSavings.toFixed(2)}`, 390, startY + 35);

  doc.moveDown(4);

  // Extra details line
  doc
    .fillColor(darkTextColor)
    .font('Helvetica')
    .fontSize(11)
    .text(`Savings Rate: `, 50, 260, { continued: true })
    .font('Helvetica-Bold')
    .text(`${savingsRate.toFixed(1)}%`);

  // 3. TABLE DETAILS - EXPENSES BY CATEGORY
  doc.moveDown(2);
  doc
    .fillColor(darkTextColor)
    .font('Helvetica-Bold')
    .fontSize(14)
    .text('Category-wise Expense Breakdown', 50, 290);

  // Group expenses by category
  const categoriesMap = {};
  expenses.forEach(exp => {
    categoriesMap[exp.category] = (categoriesMap[exp.category] || 0) + exp.amount;
  });

  let currentY = 320;
  // Header row
  doc.rect(50, currentY, 495, 20).fill(primaryColor);
  doc.fillColor('#ffffff').font('Helvetica-Bold').fontSize(10);
  doc.text('Category', 60, currentY + 5);
  doc.text('Amount', 350, currentY + 5);
  doc.text('Percentage', 460, currentY + 5);

  currentY += 20;

  Object.entries(categoriesMap).forEach(([cat, amount], index) => {
    const percentage = totalExpense > 0 ? (amount / totalExpense) * 100 : 0;
    
    // Zebra rows
    if (index % 2 === 1) {
      doc.rect(50, currentY, 495, 20).fill('#f8fafc');
    }
    
    doc.fillColor(darkTextColor).font('Helvetica').fontSize(10);
    doc.text(cat, 60, currentY + 5);
    doc.text(`$${amount.toFixed(2)}`, 350, currentY + 5);
    doc.text(`${percentage.toFixed(1)}%`, 460, currentY + 5);

    currentY += 20;
  });

  // Footer text
  doc
    .fillColor(lightTextColor)
    .fontSize(9)
    .text('Thank you for using Personal Finance Manager to manage your finances!', 50, 750, { align: 'center' });

  doc.end();
};

module.exports = { generatePDFReport };
