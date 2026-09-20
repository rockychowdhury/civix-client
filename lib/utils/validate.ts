import type { ZodType } from "zod";

export type RequestPayloadField = unknown;
export type RequestPayload = {
  body?: unknown;
  query?: unknown;
  params?: unknown;
  cookies?: unknown;
};

export function validateInput<T>(schema: ZodType<T>, value: unknown): T {
  const result = schema.safeParse(value);
  if (!result.success) {
    throw result.error;
  }
  return result.data;
}

export function validateRequestData<T extends RequestPayload>(
  schema: ZodType<T>,
  payload: RequestPayload,
): T {
  const result = schema.safeParse(payload);
  if (!result.success) {
    throw result.error;
  }
  return result.data;
}
