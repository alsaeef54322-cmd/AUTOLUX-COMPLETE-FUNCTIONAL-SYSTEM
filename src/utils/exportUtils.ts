/**
 * Universal export utilities supporting Arabic UTF-8 encoding and Excel compatibility
 */

export interface ExportColumn<T> {
  header: string;
  key: keyof T | ((item: T) => any);
}

export function exportToCSV<T extends Record<string, any>>(
  filename: string,
  columns: ExportColumn<T>[],
  data: T[]
): void;
export function exportToCSV<T extends Record<string, any>>(
  data: T[],
  filename: string
): void;
export function exportToCSV<T extends Record<string, any>>(
  arg1: string | T[],
  arg2?: string | ExportColumn<T>[],
  arg3?: T[]
): void {
  let filename = 'export';
  let rowsFormatted: string[] = [];
  let headerRow = '';

  if (Array.isArray(arg1)) {
    // Called as: exportToCSV(data, filename)
    const data = arg1;
    filename = typeof arg2 === 'string' ? arg2 : 'export';
    if (!data || data.length === 0) {
      console.warn('No data available to export.');
      return;
    }
    const headers = Object.keys(data[0]);
    headerRow = headers.map((h) => `"${escapeCSV(h)}"`).join(',');
    rowsFormatted = data.map((item) =>
      headers
        .map((h) => {
          let val = item[h];
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
  } else {
    // Called as: exportToCSV(filename, columns, data)
    filename = arg1;
    const columns = (arg2 as ExportColumn<T>[]) || [];
    const data = arg3 || [];
    if (!data || data.length === 0) {
      console.warn('No data available to export.');
      return;
    }
    headerRow = columns.map((col) => `"${escapeCSV(col.header)}"`).join(',');
    rowsFormatted = data.map((item) =>
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
  }

  // Prepend UTF-8 Byte Order Mark (BOM) so Excel reads Arabic & special characters properly
  const csvContent = '\uFEFF' + [headerRow, ...rowsFormatted].join('\r\n');
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
