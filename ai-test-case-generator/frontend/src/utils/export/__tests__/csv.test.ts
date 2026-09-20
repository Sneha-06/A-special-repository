import { describe, expect, it } from "vitest";
import { toCsv } from "../csv";

describe("toCsv", () => {
  it("escapes commas and quotes in cell values", () => {
    const csv = toCsv(
      [{ name: 'Test "Case"', value: "a,b" }],
      [
        { header: "Name", value: (row) => row.name },
        { header: "Value", value: (row) => row.value },
      ],
    );

    expect(csv).toBe('Name,Value\n"Test ""Case""","a,b"');
  });

  it("renders headers and rows", () => {
    const csv = toCsv(
      [{ id: "TC-001" }],
      [{ header: "ID", value: (row) => row.id }],
    );

    expect(csv).toBe("ID\nTC-001");
  });
});
