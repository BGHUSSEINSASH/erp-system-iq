// Export utilities for PDF and Excel/CSV

export function exportToCSV(data: Record<string, any>[], filename: string) {
  if (data.length === 0) return;
  var headers = Object.keys(data[0]);
  var csv = headers.join(",") + "\n";
  data.forEach(function (row) {
    var values = headers.map(function (h) {
      var val = String(row[h] ?? "");
      // Escape commas and quotes
      if (val.indexOf(",") >= 0 || val.indexOf('"') >= 0 || val.indexOf("\n") >= 0) {
        val = '"' + val.replace(/"/g, '""') + '"';
      }
      return val;
    });
    csv += values.join(",") + "\n";
  });
  // Add BOM for Arabic support
  var blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
  downloadBlob(blob, filename + ".csv");
}

export function exportToExcel(data: Record<string, any>[], filename: string, headers?: Record<string, string>) {
  if (data.length === 0) return;
  var keys = Object.keys(data[0]);
  var headerLabels = keys.map(function (k) { return headers ? (headers[k] || k) : k; });

  var xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<?mso-application progid="Excel.Sheet"?>\n';
  xml += '<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet" xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet">\n';
  xml += '<Styles><Style ss:ID="header"><Font ss:Bold="1" ss:Size="12"/><Interior ss:Color="#6366f1" ss:Pattern="Solid"/><Font ss:Color="#FFFFFF"/></Style></Styles>\n';
  xml += '<Worksheet ss:Name="Sheet1"><Table>\n';

  // Header row
  xml += '<Row>';
  headerLabels.forEach(function (h) {
    xml += '<Cell ss:StyleID="header"><Data ss:Type="String">' + escapeXml(h) + '</Data></Cell>';
  });
  xml += '</Row>\n';

  // Data rows
  data.forEach(function (row) {
    xml += '<Row>';
    keys.forEach(function (k) {
      var val = row[k];
      var type = typeof val === "number" ? "Number" : "String";
      xml += '<Cell><Data ss:Type="' + type + '">' + escapeXml(String(val ?? "")) + '</Data></Cell>';
    });
    xml += '</Row>\n';
  });

  xml += '</Table></Worksheet></Workbook>';

  var blob = new Blob([xml], { type: "application/vnd.ms-excel" });
  downloadBlob(blob, filename + ".xls");
}

export function exportToPDF(title: string, elementId?: string) {
  var printWin = window.open("", "_blank");
  if (!printWin) return;

  var content = "";
  if (elementId) {
    var el = document.getElementById(elementId);
    if (el) content = el.innerHTML;
  } else {
    var mainContent = document.querySelector(".content-3d") || document.querySelector(".content") || document.querySelector(".page");
    if (mainContent) content = mainContent.innerHTML;
  }

  printWin.document.write(
    '<html dir="rtl"><head><title>' + title + '</title>' +
    '<style>' +
    'body { font-family: Tajawal, Arial, sans-serif; direction: rtl; padding: 20px; color: #333; }' +
    'h2, h3 { color: #1e293b; margin-bottom: 16px; }' +
    'table { width: 100%; border-collapse: collapse; margin: 16px 0; }' +
    'th { background: #6366f1; color: white; padding: 10px; text-align: right; }' +
    'td { padding: 8px 10px; border-bottom: 1px solid #e2e8f0; }' +
    'tr:nth-child(even) { background: #f8fafc; }' +
    '.stats-grid { display: flex; gap: 16px; flex-wrap: wrap; margin: 16px 0; }' +
    '.stat-card { border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; min-width: 180px; }' +
    '.badge { padding: 2px 8px; border-radius: 4px; font-size: 0.8rem; }' +
    '.btn, button { display: none; }' +
    '@media print { body { -webkit-print-color-adjust: exact; } }' +
    '</style></head><body>' +
    '<h2>' + title + '</h2>' +
    '<div>' + content + '</div>' +
    '</body></html>'
  );
  printWin.document.close();
  setTimeout(function () { printWin!.print(); }, 500);
}

function downloadBlob(blob: Blob, filename: string) {
  var url = URL.createObjectURL(blob);
  var a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function escapeXml(s: string) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
}
