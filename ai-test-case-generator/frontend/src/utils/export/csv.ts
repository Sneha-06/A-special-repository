import { downloadText } from "./download";

export interface CsvColumn<T> {
  header: string;
  value: (row: T) => string | number | boolean | null | undefined;
}

function escapeCsvCell(value: string): string {
  if (/[",\n\r]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

export function toCsv<T>(rows: T[], columns: CsvColumn<T>[]): string {
  const header = columns.map((col) => escapeCsvCell(col.header)).join(",");
  const lines = rows.map((row) =>
    columns
      .map((col) => {
        const raw = col.value(row);
        const text = raw === null || raw === undefined ? "" : String(raw);
        return escapeCsvCell(text);
      })
      .join(","),
  );
  return [header, ...lines].join("\n");
}

export function exportCsv<T>(rows: T[], columns: CsvColumn<T>[], filename: string) {
  downloadText(toCsv(rows, columns), filename, "text/csv;charset=utf-8");
}
