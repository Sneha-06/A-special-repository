import Editor, { type Monaco } from "@monaco-editor/react";
import { Box } from "@mui/material";
import { useCallback, useEffect, useRef } from "react";
import type { editor as MonacoEditor } from "monaco-editor";
import type { ReviewSeverity } from "../../types/review";

export interface EditorHighlight {
  issueId: string;
  lineStart: number;
  lineEnd: number;
  severity: ReviewSeverity;
}

interface CodeEditorProps {
  value: string;
  language: string;
  onChange: (value: string) => void;
  height?: string | number;
  readOnly?: boolean;
  highlights?: EditorHighlight[];
  activeIssueId?: string | null;
  scrollToLine?: number | null;
}

export function CodeEditor({
  value,
  language,
  onChange,
  height = "100%",
  readOnly = false,
  highlights = [],
  activeIssueId = null,
  scrollToLine = null,
}: CodeEditorProps) {
  const editorRef = useRef<MonacoEditor.IStandaloneCodeEditor | null>(null);
  const monacoRef = useRef<Monaco | null>(null);
  const decorationIdsRef = useRef<string[]>([]);

  const applyDecorations = useCallback(() => {
    const editor = editorRef.current;
    const monaco = monacoRef.current;
    if (!editor || !monaco) return;

    const decorations = highlights.map((h) => {
      const isActive = h.issueId === activeIssueId;
      const start = h.lineStart;
      const end = h.lineEnd ?? h.lineStart;

      return {
        range: new monaco.Range(start, 1, end, 1),
        options: {
          isWholeLine: true,
          className: `monaco-severity-${h.severity}${isActive ? " monaco-severity-active" : ""}`,
          glyphMarginClassName: `monaco-severity-glyph-${h.severity}`,
          linesDecorationsClassName: `monaco-severity-glyph-${h.severity}`,
          overviewRuler: {
            color: getComputedStyle(document.documentElement).getPropertyValue(`--monaco-ruler-${h.severity}`) || undefined,
            position: monaco.editor.OverviewRulerLane.Right,
          },
        },
      };
    });

    decorationIdsRef.current = editor.deltaDecorations(decorationIdsRef.current, decorations);
  }, [highlights, activeIssueId]);

  useEffect(() => {
    applyDecorations();
  }, [applyDecorations]);

  useEffect(() => {
    const editor = editorRef.current;
    if (!editor || !scrollToLine) return;
    editor.revealLineInCenter(scrollToLine);
    editor.setPosition({ lineNumber: scrollToLine, column: 1 });
    editor.focus();
  }, [scrollToLine]);

  const handleMount = (editor: MonacoEditor.IStandaloneCodeEditor, monaco: Monaco) => {
    editorRef.current = editor;
    monacoRef.current = monaco;
  };

  return (
    <Box sx={{ border: 1, borderColor: "divider", borderRadius: 2, overflow: "hidden", height }}>
      <Editor
        height="100%"
        language={language}
        value={value}
        onChange={(v) => onChange(v ?? "")}
        theme="vs-dark"
        onMount={handleMount}
        options={{
          readOnly,
          minimap: { enabled: false },
          fontSize: 13,
          lineNumbers: "on",
          scrollBeyondLastLine: false,
          automaticLayout: true,
          tabSize: 2,
          glyphMargin: true,
        }}
      />
    </Box>
  );
}
