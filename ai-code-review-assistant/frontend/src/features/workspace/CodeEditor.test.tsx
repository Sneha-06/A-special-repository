import { describe, expect, it, vi } from "vitest";
import { fireEvent, screen } from "@testing-library/react";
import { CodeEditor } from "./CodeEditor";
import { renderWithTheme } from "../../test/renderWithTheme";

vi.mock("@monaco-editor/react", () => ({
  default: ({
    value,
    onChange,
  }: {
    value: string;
    onChange?: (value: string) => void;
  }) => (
    <textarea
      data-testid="monaco-editor"
      value={value}
      onChange={(event) => onChange?.(event.target.value)}
    />
  ),
}));

describe("CodeEditor", () => {
  it("renders code and propagates changes", () => {
    const onChange = vi.fn();
    renderWithTheme(
      <CodeEditor value="const x = 1;" language="typescript" onChange={onChange} height={200} />,
    );

    const editor = screen.getByTestId("monaco-editor");
    expect(editor).toHaveValue("const x = 1;");

    fireEvent.change(editor, { target: { value: "const x = 2;" } });
    expect(onChange).toHaveBeenCalledWith("const x = 2;");
  });

  it("renders in read-only mode without crashing", () => {
    renderWithTheme(
      <CodeEditor value="readonly" language="typescript" onChange={vi.fn()} readOnly height={200} />,
    );

    expect(screen.getByTestId("monaco-editor")).toBeInTheDocument();
  });
});
