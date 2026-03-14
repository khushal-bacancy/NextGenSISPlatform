export type ApiEnvelope<T> = {
  data: T | null;
  error: string | null;
  meta?: Record<string, string | number | boolean | null>;
};

export function ok<T>(data: T, meta?: ApiEnvelope<T>["meta"]): Response {
  return Response.json({ data, error: null, meta } satisfies ApiEnvelope<T>);
}

export function badRequest(message: string): Response {
  return Response.json({ data: null, error: message } satisfies ApiEnvelope<never>, { status: 400 });
}

export function serverError(message: string): Response {
  return Response.json({ data: null, error: message } satisfies ApiEnvelope<never>, { status: 500 });
}
