const PDFDocument = require('pdfkit');
const XLSX = require('xlsx');

const buildWorkbookBuffer = (sheetName, rows) => {
  const workbook = XLSX.utils.book_new();
  const worksheet = XLSX.utils.json_to_sheet(rows);
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
  return XLSX.write(workbook, { bookType: 'xlsx', type: 'buffer' });
};

const buildPdfBuffer = ({ title, rows }) => new Promise((resolve) => {
  const document = new PDFDocument({ margin: 36, size: 'A4' });
  const buffers = [];

  document.on('data', (chunk) => buffers.push(chunk));
  document.on('end', () => resolve(Buffer.concat(buffers)));

  document.fontSize(18).text(title, { underline: true });
  document.moveDown();

  rows.forEach((row) => {
    Object.entries(row).forEach(([key, value]) => {
      document.fontSize(10).text(`${key}: ${value}`);
    });
    document.moveDown(0.5);
  });

  document.end();
});

module.exports = {
  buildWorkbookBuffer,
  buildPdfBuffer
};

