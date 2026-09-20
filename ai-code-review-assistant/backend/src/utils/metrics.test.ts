import { describe, expect, it } from "vitest";
import { computeCodeMetrics } from "../services/codeAnalysis/metrics";

describe("computeCodeMetrics", () => {
  it("counts lines and functions", () => {
    const code = `function a() {}\nconst b = () => {};\nif (x) {}`;
    const metrics = computeCodeMetrics(code);
    expect(metrics.lines).toBe(3);
    expect(metrics.functions).toBeGreaterThanOrEqual(2);
    expect(metrics.complexityEstimate).toBeGreaterThan(1);
  });
});
