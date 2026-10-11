/**
 * Universal export utilities supporting Arabic UTF-8 encoding and Excel compatibility
 */

export interface ExportColumn<T> {
  header: string;
  key: keyof T | ((item: T) => any);
}

export function exportToCSV<T>(filename: string, columns: ExportColumn<T>[], data: T[]) {
  if (!data || data.length === 0) {
    alert('No data available to export.');
    return;
  }

  // Format headers
  const headerRow = columns.map((col) => `"${escapeCSV(col.header)}"`).join(',');

  // Format rows
  const rows = data.map((item) =>
    columns
      .map((col) => {
        let val: any;
        if (typeof col.key === 'function') {
          val = col.key(item);
        } else {
          val = item[col.key];
        }

        if (val === null || val === undefined) {
          val = '';
        } else if (typeof val === 'object') {
          val = JSON.stringify(val);
        } else {
          val = String(val);
        }

        return `"${escapeCSV(val)}"`;
      })
      .join(',')
  );

  // Prepend UTF-8 Byte Order Mark (BOM) so Excel reads Arabic & special characters properly
  const csvContent = '\uFEFF' + [headerRow, ...rows].join('\r\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename.replace(/\s+/g, '_')}_${new Date().toISOString().substring(0, 10)}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function escapeCSV(str: string): string {
  return str.replace(/"/g, '""');
}
