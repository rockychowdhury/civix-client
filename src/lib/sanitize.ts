/**
 * Input sanitization and cleaning utilities for citizen reports and form inputs.
 * Ensures security against XSS, control characters, and malformed payload submissions.
 */

function removeControlCharacters(text: string): string {
  let result = "";
  for (let i = 0; i < text.length; i++) {
    const code = text.charCodeAt(i);
    if (code === 10 || code === 13 || code === 9 || (code >= 32 && code !== 127)) {
      result += text[i];
    }
  }
  return result;
}

export function sanitizeText(value: unknown): string {
  if (value === null || value === undefined) {
    return "";
  }

  const str = String(value);

  const stripped = str
    .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "")
    .replace(/<style\b[^<]*(?:(?!<\/style>)<[^<]*)*<\/style>/gi, "")
    .replace(/<[^>]+>/g, "");

  return removeControlCharacters(stripped).trim();
}

export function sanitizeMultilineText(value: unknown): string {
  const sanitized = sanitizeText(value);
  return sanitized.replace(/\n{3,}/g, "\n\n");
}

export function sanitizeCoordinate(coord: unknown, type: "lat" | "lng"): number | null {
  if (coord === null || coord === undefined || coord === "") {
    return null;
  }

  const num = typeof coord === "number" ? coord : Number(coord);
  if (Number.isNaN(num)) {
    return null;
  }

  if (type === "lat") {
    return num >= -90 && num <= 90 ? Number(num.toFixed(6)) : null;
  }

  return num >= -180 && num <= 180 ? Number(num.toFixed(6)) : null;
}

export function sanitizeNullableString(value: unknown): string | null {
  if (value === null || value === undefined) {
    return null;
  }
  const clean = sanitizeText(value);
  return clean.length > 0 ? clean : null;
}
