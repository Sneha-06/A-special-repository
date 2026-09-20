import { jsPDF } from "jspdf";
import type { AnalysisResult } from "../../types/requirement";

function addSection(doc: jsPDF, title: string, items: string[], y: number): number {
  const margin = 40;
  const pageWidth = doc.internal.pageSize.getWidth();
  const maxWidth = pageWidth - margin * 2;

  if (y > doc.internal.pageSize.getHeight() - 60) {
    doc.addPage();
    y = 40;
  }

  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text(title, margin, y);
  y += 16;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);

  if (items.length === 0) {
    const lines = doc.splitTextToSize("None", maxWidth);
    doc.text(lines, margin, y);
    y += lines.length * 12 + 8;
    return y;
  }

  for (const item of items) {
    const lines = doc.splitTextToSize(`• ${item}`, maxWidth);
    if (y + lines.length * 12 > doc.internal.pageSize.getHeight() - 40) {
      doc.addPage();
      y = 40;
    }
    doc.text(lines, margin, y);
    y += lines.length * 12 + 4;
  }

  return y + 8;
}

export function exportAnalysisPdf(
  analysis: AnalysisResult,
  meta: { requirementTitle: string; projectName?: string; analyzedAt?: string },
  filename: string,
) {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const margin = 40;
  let y = 48;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.text("Requirement Analysis Report", margin, y);
  y += 28;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(11);
  doc.text(`Requirement: ${meta.requirementTitle}`, margin, y);
  y += 16;
  if (meta.projectName) {
    doc.text(`Project: ${meta.projectName}`, margin, y);
    y += 16;
  }
  if (meta.analyzedAt) {
    doc.text(`Analyzed: ${new Date(meta.analyzedAt).toLocaleString()}`, margin, y);
    y += 20;
  }

  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.text("Summary", margin, y);
  y += 16;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  const summaryLines = doc.splitTextToSize(analysis.summary, doc.internal.pageSize.getWidth() - margin * 2);
  doc.text(summaryLines, margin, y);
  y += summaryLines.length * 12 + 12;

  const sections: Array<[string, string[]]> = [
    ["Actors", analysis.actors],
    ["Preconditions", analysis.preconditions],
    ["Business Rules", analysis.businessRules],
    ["Functional Requirements", analysis.functionalRequirements],
    ["Non-functional Requirements", analysis.nonFunctionalRequirements],
    ["Assumptions", analysis.assumptions],
    ["Ambiguities", analysis.ambiguities],
    ["Missing Information", analysis.missingInformation],
    ["Risk Areas", analysis.riskAreas],
  ];

  for (const [title, items] of sections) {
    y = addSection(doc, title, items, y);
  }

  doc.save(filename.endsWith(".pdf") ? filename : `${filename}.pdf`);
}
