import type { SyntheticTestDataRow } from "../types/syntheticTestData";
import { toCsv } from "../utils/export";
import { api } from "./api";

export async function fetchSyntheticTestData(
  requirementId: string,
): Promise<SyntheticTestDataRow[]> {
  const { data } = await api.get<{ testData: SyntheticTestDataRow[] }>("/test-data", {
    params: { requirementId },
  });
  return data.testData;
}

export async function generateSyntheticTestData(
  requirementId: string,
  replaceExisting = true,
): Promise<SyntheticTestDataRow[]> {
  const { data } = await api.post<{ testData: SyntheticTestDataRow[] }>(
    "/test-data/generate",
    { requirementId, replaceExisting },
  );
  return data.testData;
}

const TEST_DATA_COLUMNS = [
  { header: "Field", value: (row: SyntheticTestDataRow) => row.field },
  { header: "Value", value: (row: SyntheticTestDataRow) => row.value },
  { header: "Data Type", value: (row: SyntheticTestDataRow) => row.dataType },
  { header: "Purpose", value: (row: SyntheticTestDataRow) => row.purpose },
];

export function exportTestDataCsv(rows: SyntheticTestDataRow[]): string {
  return toCsv(rows, TEST_DATA_COLUMNS);
}

export function copyTestDataToClipboard(rows: SyntheticTestDataRow[]): string {
  return rows
    .map((row) => `${row.field}\t${row.value}\t${row.dataType}\t${row.purpose}`)
    .join("\n");
}
