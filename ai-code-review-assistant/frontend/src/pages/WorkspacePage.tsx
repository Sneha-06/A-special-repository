import { Alert, Box, Card, CardContent, Stack, Tab, Tabs, Typography } from "@mui/material";
import { useMemo, useState } from "react";
import { PageHeader } from "../components/common/PageHeader";
import { DocumentationPanel } from "../features/documentation/DocumentationPanel";
import { DocumentationToolbar } from "../features/documentation/DocumentationToolbar";
import { ExplanationPanel } from "../features/explanation/ExplanationPanel";
import { ExplainToolbar } from "../features/explanation/ExplainToolbar";
import { RefactorOptionsBar } from "../features/refactor/RefactorOptionsBar";
import { RefactorResultsPanel } from "../features/refactor/RefactorResultsPanel";
import { TestGeneratorPanel } from "../features/tests/TestGeneratorPanel";
import { TestGeneratorToolbar } from "../features/tests/TestGeneratorToolbar";
import { FixComparisonDialog } from "../features/review/FixComparisonDialog";
import { ReviewResultsPanel } from "../features/review/ReviewResultsPanel";
import { ReviewToolbar } from "../features/review/ReviewToolbar";
import { CodeEditor, type EditorHighlight } from "../features/workspace/CodeEditor";
import { useAppDispatch, useAppSelector } from "../hooks/useAppDispatch";
import { generateDocumentation } from "../services/documentationService";
import { explainCode } from "../services/explanationService";
import { createRefactor } from "../services/refactorService";
import { generateTests } from "../services/testGeneratorService";
import { createReview } from "../services/reviewService";
import {
  setError, setFilePath, setLanguage, setLoading, setSourceCode,
} from "../store/slices/workspaceSlice";
import type { DocFormat, DocumentationResult } from "../types/documentation";
import type { CodeExplanation } from "../types/explanation";
import type { RefactorOption, RefactorResult } from "../types/refactor";
import type { TestGeneratorResult, TestingFramework } from "../types/testGenerator";
import type { CodeReviewResult, ReviewIssue, ReviewType } from "../types/review";

type ResultTab = "review" | "explanation" | "documentation" | "refactor" | "tests";

function resolveTestLanguage(language: string): "typescript" | "javascript" | "tsx" | "jsx" {
  if (language === "tsx" || language === "jsx" || language === "typescript" || language === "javascript") {
    return language;
  }
  if (language === "js") return "javascript";
  return language.includes("jsx") ? "jsx" : "typescript";
}

function resolveTestFramework(language: string, framework: string): "react" | "javascript" | "typescript" {
  if (framework === "react" || language === "tsx" || language === "jsx") return "react";
  if (language === "javascript" || language === "js") return "javascript";
  return "typescript";
}

export function WorkspacePage() {
  const dispatch = useAppDispatch();
  const ws = useAppSelector((s) => s.workspace);

  const [framework, setFramework] = useState("react");
  const [reviewTypes, setReviewTypes] = useState<ReviewType[]>(["general"]);
  const [refactorOptions, setRefactorOptions] = useState<RefactorOption[]>(["readability"]);
  const [docFormat, setDocFormat] = useState<DocFormat>("markdown");
  const [projectContext, setProjectContext] = useState("");
  const [reviewResult, setReviewResult] = useState<CodeReviewResult | null>(null);
  const [explanation, setExplanation] = useState<CodeExplanation | null>(null);
  const [documentation, setDocumentation] = useState<DocumentationResult | null>(null);
  const [refactorResult, setRefactorResult] = useState<RefactorResult | null>(null);
  const [testResult, setTestResult] = useState<TestGeneratorResult | null>(null);
  const [testingFramework, setTestingFramework] = useState<TestingFramework>("vitest");
  const [explainLoading, setExplainLoading] = useState(false);
  const [docLoading, setDocLoading] = useState(false);
  const [refactorLoading, setRefactorLoading] = useState(false);
  const [testLoading, setTestLoading] = useState(false);
  const [selectedIssueId, setSelectedIssueId] = useState<string | null>(null);
  const [scrollToLine, setScrollToLine] = useState<number | null>(null);
  const [fixIssue, setFixIssue] = useState<ReviewIssue | null>(null);
  const [activeTab, setActiveTab] = useState<ResultTab>("review");

  const hasResults = Boolean(reviewResult || explanation || documentation || refactorResult || testResult);

  const highlights = useMemo<EditorHighlight[]>(() => {
    if (!reviewResult) return [];
    return reviewResult.issues
      .filter((i) => i.lineStart)
      .map((i) => ({
        issueId: i.id,
        lineStart: i.lineStart!,
        lineEnd: i.lineEnd ?? i.lineStart!,
        severity: i.severity,
      }));
  }, [reviewResult]);

  const busy = ws.loading || explainLoading || docLoading || refactorLoading || testLoading;

  const handleReview = async () => {
    if (!ws.sourceCode.trim()) { dispatch(setError("Please paste code before requesting a review.")); return; }
    dispatch(setLoading(true));
    dispatch(setError(null));
    try {
      const { review: result } = await createReview({
        code: ws.sourceCode, language: ws.language, framework,
        fileName: ws.filePath || undefined, reviewType: reviewTypes,
        projectContext: projectContext || undefined,
      });
      setReviewResult(result);
      setActiveTab("review");
      if (result.issues.length > 0) {
        const first = result.issues.find((i) => i.lineStart) ?? result.issues[0];
        setSelectedIssueId(first.id);
        if (first.lineStart) setScrollToLine(first.lineStart);
      }
    } catch (e) {
      dispatch(setError(e instanceof Error ? e.message : "Code review failed."));
    } finally {
      dispatch(setLoading(false));
    }
  };

  const handleExplain = async () => {
    if (!ws.sourceCode.trim()) { dispatch(setError("Please paste code before requesting an explanation.")); return; }
    setExplainLoading(true);
    dispatch(setError(null));
    try {
      const result = await explainCode({ code: ws.sourceCode, language: ws.language, context: projectContext || undefined });
      setExplanation(result);
      setActiveTab("explanation");
    } catch (e) {
      dispatch(setError(e instanceof Error ? e.message : "Code explanation failed."));
    } finally {
      setExplainLoading(false);
    }
  };

  const handleGenerateDocs = async () => {
    if (!ws.sourceCode.trim()) { dispatch(setError("Please paste code before generating documentation.")); return; }
    setDocLoading(true);
    dispatch(setError(null));
    try {
      const result = await generateDocumentation({
        code: ws.sourceCode, language: ws.language, framework,
        format: docFormat, fileName: ws.filePath || undefined,
      });
      setDocumentation(result);
      setActiveTab("documentation");
    } catch (e) {
      dispatch(setError(e instanceof Error ? e.message : "Documentation generation failed."));
    } finally {
      setDocLoading(false);
    }
  };

  const handleGenerateTests = async () => {
    if (!ws.sourceCode.trim()) { dispatch(setError("Please paste code before generating tests.")); return; }
    setTestLoading(true);
    dispatch(setError(null));
    try {
      const lang = resolveTestLanguage(ws.language);
      const result = await generateTests({
        code: ws.sourceCode,
        language: lang,
        framework: resolveTestFramework(ws.language, framework),
        testingFramework,
        fileName: ws.filePath || undefined,
      });
      setTestResult(result);
      setActiveTab("tests");
    } catch (e) {
      dispatch(setError(e instanceof Error ? e.message : "Test generation failed."));
    } finally {
      setTestLoading(false);
    }
  };

  const handleImprove = async () => {
    if (!ws.sourceCode.trim()) { dispatch(setError("Please paste code before requesting improvements.")); return; }
    setRefactorLoading(true);
    dispatch(setError(null));
    try {
      const issues = reviewResult?.issues.map((i) => ({
        id: i.id, title: i.title, description: i.description,
        severity: i.severity, category: i.category, suggestion: i.suggestion,
      }));
      const result = await createRefactor({
        code: ws.sourceCode, language: ws.language, framework,
        fileName: ws.filePath || undefined, issues, options: refactorOptions,
      });
      setRefactorResult(result);
      setActiveTab("refactor");
    } catch (e) {
      dispatch(setError(e instanceof Error ? e.message : "Code improvement failed."));
    } finally {
      setRefactorLoading(false);
    }
  };

  return (
    <>
      <PageHeader
        title="Developer Workspace"
        subtitle="Review, explain, document, and refactor code with structured AI assistance"
      />

      <ReviewToolbar
        language={ws.language} framework={framework} fileName={ws.filePath}
        projectContext={projectContext} reviewTypes={reviewTypes} loading={busy}
        onLanguageChange={(v) => dispatch(setLanguage(v))}
        onFrameworkChange={setFramework}
        onFileNameChange={(v) => dispatch(setFilePath(v))}
        onProjectContextChange={setProjectContext}
        onReviewTypesChange={setReviewTypes}
        onReview={handleReview}
      />

      <Stack direction="row" flexWrap="wrap" alignItems="flex-start" gap={1} sx={{ mb: 2 }}>
        <ExplainToolbar loading={busy} onExplain={handleExplain} />
        <DocumentationToolbar format={docFormat} loading={busy} onFormatChange={setDocFormat} onGenerate={handleGenerateDocs} />
      </Stack>

      <TestGeneratorToolbar
        testingFramework={testingFramework}
        loading={busy}
        onFrameworkChange={setTestingFramework}
        onGenerate={handleGenerateTests}
      />

      <RefactorOptionsBar options={refactorOptions} loading={busy} onOptionsChange={setRefactorOptions} onImprove={handleImprove} />

      {ws.error && <Alert severity="error" sx={{ mb: 2 }}>{ws.error}</Alert>}

      <Typography variant="subtitle2" sx={{ mb: 1 }}>Source Code</Typography>
      <CodeEditor
        value={ws.sourceCode}
        language={ws.language}
        onChange={(v) => dispatch(setSourceCode(v))}
        height={hasResults ? 400 : 520}
        highlights={highlights}
        activeIssueId={selectedIssueId}
        scrollToLine={scrollToLine}
      />

      {hasResults && (
        <Box sx={{ mt: 3 }}>
          <Tabs value={activeTab} onChange={(_, v) => setActiveTab(v)} sx={{ mb: 2, borderBottom: 1, borderColor: "divider" }}>
            <Tab value="review" label="Review" disabled={!reviewResult} />
            <Tab value="explanation" label="Explanation" disabled={!explanation} />
            <Tab value="documentation" label="Documentation" disabled={!documentation} />
            <Tab value="refactor" label="Refactor" disabled={!refactorResult} />
            <Tab value="tests" label="Test Generator" disabled={!testResult} />
          </Tabs>

          {activeTab === "review" && reviewResult && (
            <Card><CardContent>
              <ReviewResultsPanel
                review={reviewResult}
                selectedIssueId={selectedIssueId}
                onSelectIssue={(issue) => {
                  setSelectedIssueId(issue.id);
                  if (issue.lineStart) setScrollToLine(issue.lineStart);
                }}
                onApplyFix={setFixIssue}
              />
            </CardContent></Card>
          )}

          {activeTab === "explanation" && explanation && (
            <Card><CardContent><ExplanationPanel explanation={explanation} /></CardContent></Card>
          )}

          {activeTab === "documentation" && documentation && (
            <DocumentationPanel result={documentation} onRegenerate={handleGenerateDocs} regenerating={docLoading} />
          )}

          {activeTab === "refactor" && refactorResult && (
            <RefactorResultsPanel
              result={refactorResult}
              language={ws.language}
              fileName={ws.filePath}
              onApply={(code) => { dispatch(setSourceCode(code)); setRefactorResult(null); }}
              onRegenerate={handleImprove}
              regenerating={refactorLoading}
            />
          )}

          {activeTab === "tests" && testResult && (
            <TestGeneratorPanel
              result={testResult}
              onRegenerate={handleGenerateTests}
              regenerating={testLoading}
            />
          )}
        </Box>
      )}

      <FixComparisonDialog
        open={Boolean(fixIssue)}
        issue={fixIssue}
        sourceCode={ws.sourceCode}
        language={ws.language}
        onClose={() => setFixIssue(null)}
      />
    </>
  );
}
