import { Dataset, ColumnMeta } from '../types';

export function parseCsvText(filename: string, content: string): Dataset {
  const lines = content.split(/\r?\n/).filter((l) => l.trim().length > 0);
  if (lines.length === 0) {
    throw new Error('CSV file is empty');
  }

  // Parse header
  const headers = parseCsvLine(lines[0]);
  const rows: Record<string, any>[] = [];

  for (let i = 1; i < lines.length; i++) {
    const rawVals = parseCsvLine(lines[i]);
    if (rawVals.length === 0) continue;
    const rowObj: Record<string, any> = {};
    headers.forEach((h, idx) => {
      const raw = rawVals[idx] !== undefined ? rawVals[idx].trim() : '';
      if (raw === '') {
        rowObj[h] = null;
      } else if (!isNaN(Number(raw)) && raw !== '') {
        rowObj[h] = Number(raw);
      } else if (raw.toLowerCase() === 'true' || raw.toLowerCase() === 'false') {
        rowObj[h] = raw.toLowerCase() === 'true';
      } else {
        rowObj[h] = raw;
      }
    });
    rows.push(rowObj);
  }

  const numericColumns: string[] = [];
  const dateColumns: string[] = [];
  const categoricalColumns: string[] = [];
  let totalMissing = 0;

  const columns: ColumnMeta[] = headers.map((col) => {
    let numCount = 0;
    let dateCount = 0;
    let missingCount = 0;
    const samples: any[] = [];

    rows.forEach((r) => {
      const val = r[col];
      if (val === null || val === undefined || val === '') {
        missingCount++;
        totalMissing++;
      } else {
        if (typeof val === 'number') {
          numCount++;
        } else if (typeof val === 'string' && !isNaN(Date.parse(val)) && (val.includes('-') || val.includes('/'))) {
          dateCount++;
        }
        if (samples.length < 3 && !samples.includes(val)) {
          samples.push(val);
        }
      }
    });

    const validCount = rows.length - missingCount;
    let colType: 'number' | 'string' | 'date' | 'boolean' = 'string';
    if (validCount > 0 && numCount / validCount > 0.7) {
      colType = 'number';
      numericColumns.push(col);
    } else if (validCount > 0 && dateCount / validCount > 0.7) {
      colType = 'date';
      dateColumns.push(col);
    } else {
      categoricalColumns.push(col);
    }

    return {
      name: col,
      type: colType,
      sampleValues: samples,
      missingCount,
    };
  });

  const sizeKb = Math.round(content.length / 1024);
  const sizeFormatted = sizeKb > 1024 ? `${(sizeKb / 1024).toFixed(1)} MB` : `${sizeKb} KB`;

  return {
    id: `ds-${Date.now()}`,
    name: filename.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' '),
    filename,
    fileType: filename.endsWith('.xlsx') ? 'XLSX' : filename.endsWith('.xls') ? 'XLS' : 'CSV',
    rowCount: rows.length,
    columnCount: headers.length,
    missingValues: totalMissing,
    numericColumns,
    dateColumns,
    categoricalColumns,
    columns,
    previewRows: rows.slice(0, 10),
    uploadDate: new Date().toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }),
    sizeFormatted,
    description: `User-uploaded dataset containing ${rows.length.toLocaleString()} rows and ${headers.length} columns.`,
  };
}

function parseCsvLine(line: string): string[] {
  const result: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"' || char === "'") {
      if (inQuotes && line[i + 1] === char) {
        current += char;
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current);
  return result;
}
