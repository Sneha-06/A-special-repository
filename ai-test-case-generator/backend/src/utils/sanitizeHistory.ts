const SECRET_KEY_PATTERN = /api[_-]?key|authorization|secret|password|token|bearer/i;

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function sanitizeHistoryPayload(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(sanitizeHistoryPayload);
  }

  if (!isPlainObject(value)) {
    return value;
  }

  const sanitized: Record<string, unknown> = {};
  for (const [key, entry] of Object.entries(value)) {
    if (SECRET_KEY_PATTERN.test(key)) {
      sanitized[key] = "[REDACTED]";
      continue;
    }
    sanitized[key] = sanitizeHistoryPayload(entry);
  }

  return sanitized;
}
