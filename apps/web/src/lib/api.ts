const apiBaseUrl = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, "");

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

async function requestApi(
  path: string,
  init: RequestInit = {},
): Promise<Response> {
  if (!apiBaseUrl) {
    throw new Error("NEXT_PUBLIC_API_URL is not configured.");
  }

  try {
    return await fetch(`${apiBaseUrl}/api/v2${path}`, {
      ...init,
      credentials: "include",
      headers: {
        ...(init.body ? { "Content-Type": "application/json" } : {}),
        ...init.headers,
      },
    });
  } catch {
    throw new Error("Unable to reach the API. Make sure the API server is running.");
  }
}

async function throwApiError(response: Response): Promise<never> {
  const body = await response.json().catch(() => null);
  throw new ApiError(
    body?.error ?? body?.message ?? "Request failed.",
    response.status,
  );
}

export async function apiFetch<T>(
  path: string,
  init: RequestInit = {},
): Promise<T> {
  const response = await requestApi(path, init);

  if (!response.ok) {
    return throwApiError(response);
  }

  return response.status === 204
    ? (undefined as T)
    : ((await response.json()) as T);
}

export async function apiFetchBlob(path: string): Promise<{
  blob: Blob;
  filename: string | null;
}> {
  const response = await requestApi(path);

  if (!response.ok) {
    return throwApiError(response);
  }

  return {
    blob: await response.blob(),
    filename: response.headers
      .get("Content-Disposition")
      ?.match(/filename="?([^";]+)"?/)?.[1] ?? null,
  };
}

export function getErrorMessage(error: unknown, fallback: string): string {
  return error instanceof Error && error.message ? error.message : fallback;
}
