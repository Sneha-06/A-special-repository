import * as XLSX from "xlsx";
import { downloadBlob } from "./download";
import type { CsvColumn } from "./csv";

export function exportExcel<T>(
  rows: T[],
  columns: CsvColumn<T>[],
  filename: string,
  sheetName = "Sheet1",
) {
  const data = rows.map((row) => {
    const record: Record<string, string | number | boolean> = {};
    for (const col of columns) {
      const value = col.value(row);
      record[col.header] = value === null || value === undefined ? "" : value;
    }
    return record;
  });

  const worksheet = XLSX.utils.json_to_sheet(data);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
  const buffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
  downloadBlob(
    buffer,
    filename.endsWith(".xlsx") ? filename : `${filename}.xlsx`,
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  );
}
