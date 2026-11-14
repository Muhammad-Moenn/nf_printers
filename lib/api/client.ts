import axios, { type AxiosRequestConfig } from "axios";

export class ApiError extends Error {
  status: number;
  payload: unknown;

  constructor(message: string, status: number, payload: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.payload = payload;
  }
}

type QueryValue = string | number | boolean | null | undefined;

export type ApiRequestOptions = Omit<
  RequestInit,
  "body" | "headers" | "method"
> & {
  method?: string;
  body?: BodyInit | Record<string, unknown> | null;
  query?: Record<string, QueryValue>;
  headers?: HeadersInit;
  timeout?: number;
  responseType?: "json" | "text" | "blob" | "arraybuffer" | "stream";
};

const apiClientInstance = axios.create({
  adapter: "fetch",
  validateStatus: () => true,
});

function buildUrl(path: string, query?: Record<string, QueryValue>) {
  if (!query) return path;

  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value === undefined || value === null) continue;
    params.set(key, String(value));
  }

  const search = params.toString();
  return search ? `${path}${path.includes("?") ? "&" : "?"}${search}` : path;
}

function isJsonBody(body: ApiRequestOptions["body"]): body is Record<string, unknown> {
  return (
    typeof body === "object" &&
    body !== null &&
    !(body instanceof FormData) &&
    !(body instanceof Blob) &&
    !(body instanceof ArrayBuffer) &&
    !(body instanceof URLSearchParams) &&
    !(body instanceof ReadableStream)
  );
}

function normalizeHeaders(headers?: HeadersInit): Record<string, string> {
  const normalized: Record<string, string> = {};
  if (!headers) return normalized;

  new Headers(headers).forEach((value, key) => {
    normalized[key] = value;
  });

  return normalized;
}

function hasHeader(headers: Record<string, string>, name: string) {
  return Object.keys(headers).some((key) => key.toLowerCase() === name);
}

function normalizePayload(payload: unknown): unknown {
  if (payload === undefined || payload === "") return null;
  return payload;
}

function errorMessage(payload: unknown, fallback: string) {
  if (payload && typeof payload === "object") {
    const record = payload as Record<string, unknown>;

    if (typeof record.error === "string" && record.error.trim()) {
      return record.error;
    }

    if (typeof record.message === "string" && record.message.trim()) {
      return record.message;
    }
  }

  return fallback;
}

export async function apiClient<T>(
  path: string,
  options: ApiRequestOptions = {}
): Promise<T> {
  const {
    query,
    body,
    headers,
    timeout,
    responseType,
    credentials,
    cache,
    signal,
    method,
    ...init
  } = options;

  const jsonBody = isJsonBody(body);
  const requestHeaders = normalizeHeaders(headers);

  if (jsonBody && !hasHeader(requestHeaders, "content-type")) {
    requestHeaders["Content-Type"] = "application/json";
  }

  const config: AxiosRequestConfig = {
    url: buildUrl(path, query),
    method: (method ?? "GET") as AxiosRequestConfig["method"],
    headers: requestHeaders,
    data: body ?? undefined,
    signal: signal ?? undefined,
    timeout,
    responseType,
    fetchOptions: { cache: cache ?? "no-store" },
    ...init,
  };

  if (credentials === "include") {
    config.withCredentials = true;
  } else if (credentials === "omit") {
    config.withCredentials = false;
  }

  try {
    const response = await apiClientInstance.request<T>(config);

    if (response.status < 200 || response.status >= 300) {
      throw new ApiError(
        errorMessage(
          response.data,
          `Request failed with status ${response.status}`
        ),
        response.status,
        normalizePayload(response.data)
      );
    }

    return normalizePayload(response.data) as T;
  } catch (error) {
    if (error instanceof ApiError || axios.isCancel(error)) {
      throw error;
    }

    if (axios.isAxiosError(error)) {
      const status = error.response?.status ?? 0;
      throw new ApiError(
        errorMessage(
          error.response?.data,
          status > 0 ? `Request failed with status ${status}` : "Something went wrong"
        ),
        status,
        normalizePayload(error.response?.data)
      );
    }

    throw error;
  }
}

export const apiFetch = apiClient;
