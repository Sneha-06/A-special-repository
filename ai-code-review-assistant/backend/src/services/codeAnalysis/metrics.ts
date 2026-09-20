export interface CodeMetrics {
  lines: number;
  characters: number;
  functions: number;
  complexityEstimate: number;
}

export function computeCodeMetrics(sourceCode: string): CodeMetrics {
  const lines = sourceCode.split("\n").length;
  const characters = sourceCode.length;
  const functionMatches = sourceCode.match(
    /\b(function|const\s+\w+\s*=\s*(?:async\s*)?\(|(?:async\s+)?function\s+\w+|=>\s*\{)/g,
  );
  const functions = functionMatches?.length ?? 0;
  const branchMatches = sourceCode.match(/\b(if|else|for|while|switch|case|catch|\?)\b/g);
  const complexityEstimate = 1 + (branchMatches?.length ?? 0);

  return { lines, characters, functions, complexityEstimate };
}
