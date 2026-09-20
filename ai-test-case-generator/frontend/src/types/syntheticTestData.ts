export type TestDataPurpose = "valid" | "invalid" | "boundary" | "edge" | "empty";

export interface SyntheticTestDataRow {
  id?: string;
  field: string;
  value: string;
  dataType: string;
  purpose: TestDataPurpose;
  createdAt?: string;
}
