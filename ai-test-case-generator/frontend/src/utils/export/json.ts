import { downloadText } from "./download";

export function toJson(data: unknown, pretty = true): string {
  return JSON.stringify(data, null, pretty ? 2 : 0);
}

export function exportJson(data: unknown, filename: string) {
  downloadText(toJson(data), filename, "application/json;charset=utf-8");
}
