/* ─── PDF Report Generator (Pure HTML/CSS → Print) ─── */

export interface PDFColumn {
  key: string;
  header: string;
  render?: (value: unknown) => string;
}

export interface PDFReportOptions {
  title: string;
  subtitle?: string;
  columns: PDFColumn[];
  data: Record<string, unknown>[];
  companyName?: string;
  footer?: string;
  stats?: { label: string; value: string | number }[];
}

export function generatePDFReport(opts: PDFReportOptions) {
  const {
    title,
    subtitle,
    columns,
    data,
    companyName = "نظام ERP المتكامل / Integrated ERP System",
    footer,
    stats,
  } = opts;

  const now = new Date();
  const dateStr = now.toLocaleDateString("ar-IQ", { year: "numeric", month: "long", day: "numeric" });
  const timeStr = now.toLocaleTimeString("ar-IQ");

  const statsHTML = stats
    ? `<div class="stats-row">${stats.map(s => `<div class="stat-box"><div class="stat-val">${s.value}</div><div class="stat-lbl">${s.label}</div></div>`).join("")}</div>`
    : "";

  const headerRow = columns.map(c => `<th>${c.header}</th>`).join("");
  const bodyRows = data.map((row, i) =>
    `<tr class="${i % 2 === 0 ? "even" : "odd"}">${columns.map(c => {
      const val = row[c.key];
      const rendered = c.render ? c.render(val) : String(val ?? "—");
      return `<td>${rendered}</td>`;
    }).join("")}</tr>`
  ).join("");

  const html = `<!DOCTYPE html>
<html dir="rtl" lang="ar">
<head>
<meta charset="utf-8">
<title>${title}</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700;800&display=swap');
  * { margin: 0; padding: 0; box-sizing: border-box; }
  body { font-family: 'Tajawal', sans-serif; background: #fff; color: #1e293b; padding: 30px; direction: rtl; }
  .report-header { text-align: center; margin-bottom: 30px; border-bottom: 3px solid #6366f1; padding-bottom: 20px; }
  .report-header h1 { font-size: 24px; color: #6366f1; margin-bottom: 4px; }
  .report-header .company { font-size: 18px; color: #475569; margin-bottom: 8px; }
  .report-header .meta { font-size: 13px; color: #94a3b8; }
  .subtitle { font-size: 14px; color: #64748b; margin-bottom: 20px; text-align: center; }
  .stats-row { display: flex; justify-content: center; gap: 20px; margin-bottom: 24px; flex-wrap: wrap; }
  .stat-box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 10px; padding: 14px 24px; text-align: center; min-width: 140px; }
  .stat-val { font-size: 22px; font-weight: 800; color: #6366f1; }
  .stat-lbl { font-size: 12px; color: #64748b; margin-top: 4px; }
  table { width: 100%; border-collapse: collapse; margin-top: 10px; }
  th { background: #6366f1; color: #fff; padding: 10px 14px; font-size: 13px; font-weight: 700; text-align: right; }
  td { padding: 9px 14px; font-size: 13px; border-bottom: 1px solid #e2e8f0; }
  tr.even { background: #f8fafc; }
  tr.odd { background: #fff; }
  .footer { margin-top: 30px; text-align: center; font-size: 12px; color: #94a3b8; border-top: 1px solid #e2e8f0; padding-top: 16px; }
  .total-row { font-weight: 700; background: #eef2ff !important; }
  @media print { body { padding: 15px; } }
</style>
</head>
<body>
  <div class="report-header">
    <div class="company">${companyName}</div>
    <h1>${title}</h1>
    <div class="meta">📅 ${dateStr} — ⏰ ${timeStr}</div>
  </div>
  ${subtitle ? `<div class="subtitle">${subtitle}</div>` : ""}
  ${statsHTML}
  <table>
    <thead><tr>${headerRow}</tr></thead>
    <tbody>${bodyRows}</tbody>
  </table>
  ${footer ? `<div class="footer">${footer}</div>` : `<div class="footer">تم إنشاء هذا التقرير تلقائياً — Generated automatically — إجمالي السجلات: ${data.length}</div>`}
</body>
</html>`;

  const win = window.open("", "_blank");
  if (win) {
    win.document.write(html);
    win.document.close();
    setTimeout(() => win.print(), 500);
  }
}
