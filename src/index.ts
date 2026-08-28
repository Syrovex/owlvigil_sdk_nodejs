import { createHmac, timingSafeEqual } from "node:crypto";

export const VERSION = "0.1.0";

export interface ResponseMeta {
  status: number;
  requestId: string;
  headers: Headers;
}

export interface ApiResponse<T> {
  data: T;
  meta: ResponseMeta;
}

export interface RequestOptions {
  workspaceId?: number;
  idempotencyKey?: string;
  timeoutMs?: number;
  maxRetries?: number;
  headers?: Record<string, string>;
  signal?: AbortSignal;
}

export class OwlVigilError extends Error {}

export class OwlVigilApiError extends OwlVigilError {
  constructor(
    public readonly status: number,
    public readonly requestId: string,
    public readonly code: string,
    message: string,
  ) {
    super(`owlvigil: status=${status}${code ? ` code=${code}` : ""}${requestId ? ` request_id=${requestId}` : ""}${message ? ` message=${message}` : ""}`);
    this.name = "OwlVigilApiError";
  }
}

type CredentialProvider = () => string | Promise<string>;

interface ClientOptions {
  baseUrl: string;
  credential: CredentialProvider;
  timeoutMs: number;
  maxRetries: number;
  fetch: typeof globalThis.fetch;
  unwrapEnvelope: boolean;
}

class Transport {
  constructor(private readonly options: ClientOptions) {}

  async request<T>(method: string, path: string, body?: unknown, options: RequestOptions = {}): Promise<ApiResponse<T>> {
    const url = new URL(this.options.baseUrl.replace(/\/$/, "") + (path.startsWith("/") ? path : `/${path}`));
    if (options.workspaceId !== undefined) url.searchParams.set("workspace_id", String(options.workspaceId));
    const maxRetries = options.maxRetries ?? this.options.maxRetries;
    for (let attempt = 0; ; attempt++) {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(new Error("OwlVigil request timed out")), options.timeoutMs ?? this.options.timeoutMs);
      const signal = options.signal ? AbortSignal.any([options.signal, controller.signal]) : controller.signal;
      try {
        const credential = await this.options.credential();
        if (!credential.trim()) throw new OwlVigilError("OwlVigil credential is required");
        const init: RequestInit = {
          method,
          headers: {
            accept: "application/json",
            authorization: `Bearer ${credential}`,
            "content-type": "application/json",
            "user-agent": `owlvigil-node/${VERSION}`,
            ...(options.idempotencyKey ? { "idempotency-key": options.idempotencyKey } : {}),
            ...safeHeaders(options.headers),
          },
          signal,
        };
        if (body !== undefined) init.body = JSON.stringify(body);
        const response = await this.options.fetch(url, init);
        if (this.retryable(method, response.status, options) && attempt < maxRetries) {
          await response.body?.cancel().catch(() => undefined);
          await this.delay(attempt, response.headers.get("retry-after"), signal);
          continue;
        }
        const text = await response.text();
        if (!response.ok) throw this.apiError(response, text);
        let parsed: unknown;
        try {
          parsed = text ? JSON.parse(text) as unknown : {};
        } catch {
          const responseRequestId = requestId(response.headers);
          throw new OwlVigilError(`owlvigil: invalid JSON response status=${response.status}${responseRequestId ? ` request_id=${responseRequestId}` : ""}`);
        }
        const envelope = this.options.unwrapEnvelope && isRecord(parsed) && "data" in parsed ? parsed : null;
        return {
          data: (envelope ? envelope.data : parsed) as T,
          meta: {
            status: response.status,
            requestId: requestId(response.headers) || (envelope && typeof envelope.request_id === "string" ? envelope.request_id : ""),
            headers: response.headers,
          },
        };
      } catch (error) {
        if (error instanceof OwlVigilError || options.signal?.aborted || attempt >= maxRetries || !this.retryable(method, -1, options)) throw error;
        await this.delay(attempt, null, signal);
      } finally {
        clearTimeout(timeout);
      }
    }
  }

  async *stream(path: string, body: unknown, options: RequestOptions = {}): AsyncGenerator<SseEvent> {
    const credential = await this.options.credential();
    if (!credential.trim()) throw new OwlVigilError("OwlVigil credential is required");
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(new OwlVigilError("OwlVigil stream timed out")), options.timeoutMs ?? this.options.timeoutMs);
    const signal = options.signal ? AbortSignal.any([options.signal, controller.signal]) : controller.signal;
    const init: RequestInit = {
      method: "POST",
      headers: {
        accept: "text/event-stream",
        authorization: `Bearer ${credential}`,
        "content-type": "application/json",
        "user-agent": `owlvigil-node/${VERSION}`,
        ...safeHeaders(options.headers),
      },
      body: JSON.stringify(body),
      signal,
    };
    let reader: ReadableStreamDefaultReader<string> | undefined;
    try {
      const response = await this.options.fetch(this.options.baseUrl.replace(/\/$/, "") + path, init);
      if (!response.ok) throw this.apiError(response, await response.text());
      if (!response.body) throw new OwlVigilError("OwlVigil stream response has no body");
      reader = response.body.pipeThrough(new TextDecoderStream()).getReader();
      let buffer = "";
      let lastEventId = "";
      while (true) {
        const { value, done } = await reader.read();
        buffer += value ?? "";
        let boundary: number;
        while ((boundary = findEventBoundary(buffer)) >= 0) {
          const frame = buffer.slice(0, boundary);
          buffer = buffer.slice(boundary).replace(/^(\r\n|\n|\r){2}/, "");
          const event = parseSseFrame(frame);
          if (event) {
            if (event.id !== undefined) lastEventId = event.id;
            yield { event: event.event, data: event.data, id: lastEventId };
          }
        }
        if (done) break;
      }
      const event = parseSseFrame(buffer);
      if (event) {
        if (event.id !== undefined) lastEventId = event.id;
        yield { event: event.event, data: event.data, id: lastEventId };
      }
    } finally {
      clearTimeout(timeout);
      await reader?.cancel().catch(() => undefined);
    }
  }

  private retryable(method: string, status: number, options: RequestOptions): boolean {
    const idempotent = ["GET", "HEAD", "OPTIONS"].includes(method) || Boolean(options.idempotencyKey);
    return idempotent && [-1, 408, 429, 502, 503, 504].includes(status);
  }

  private async delay(attempt: number, retryAfter: string | null, signal: AbortSignal): Promise<void> {
    const seconds = retryAfter ? Number(retryAfter) : Number.NaN;
    const dateMs = retryAfter && !Number.isFinite(seconds) ? Date.parse(retryAfter) - Date.now() : Number.NaN;
    const ceiling = Math.min(30_000, Math.max(0, Number.isFinite(seconds) ? seconds * 1000 : Number.isFinite(dateMs) ? dateMs : Math.min(2000, 200 * 2 ** attempt)));
    const ms = ceiling <= 1 ? ceiling : ceiling / 2 + Math.random() * ceiling / 2;
    await new Promise<void>((resolve, reject) => {
      const onAbort = () => { clearTimeout(timer); reject(signal.reason); };
      const timer = setTimeout(() => { signal.removeEventListener("abort", onAbort); resolve(); }, ms);
      signal.addEventListener("abort", onAbort, { once: true });
    });
  }

  private apiError(response: Response, text: string): OwlVigilApiError {
    let code = "";
    let message = response.statusText;
    let bodyRequestId = "";
    try {
      const parsed = JSON.parse(text) as { error?: { code?: string; message?: string }; code?: string; message?: string; request_id?: string };
      const error = parsed.error ?? parsed;
      code = error.code ?? "";
      message = error.message ?? message;
      bodyRequestId = parsed.request_id ?? "";
    } catch { /* Never include an unparsed body in the exception. */ }
    return new OwlVigilApiError(response.status, requestId(response.headers) || bodyRequestId, code, message);
  }
}

export interface Message { role: string; content?: string | null | Array<Record<string, unknown>>; name?: string; tool_call_id?: string; tool_calls?: Array<Record<string, unknown>> }
export interface ChatCompletionRequest { model: string; messages: Message[]; temperature?: number; max_tokens?: number; max_completion_tokens?: number; top_p?: number; tools?: Array<Record<string, unknown>>; tool_choice?: unknown; response_format?: Record<string, unknown>; stream?: boolean; [key: string]: unknown }
export interface ChatCompletion { id: string; model: string; choices: Array<{ index: number; message?: Message; finish_reason?: string }>; usage?: { prompt_tokens: number; completion_tokens: number; total_tokens: number } }
export interface ModelList { object: string; data: Array<{ id: string; object?: string; created?: number; owned_by?: string }> }
export interface SseEvent { event: string; data: string; id: string }
export interface WorkspaceList { items: Array<{ id: number; workspace_id?: number; name: string; slug?: string; status?: string; role?: string }>; page_info: { next_cursor?: string; has_more?: boolean } }
export interface UsageSummary { workspace_id?: number; requests: number; tokens: number; cost: number; current_period?: string }
export interface RequestLog { request_id: string; model: string; status: string; status_code: number; total_tokens: number; total_cost: number; [key: string]: unknown }

export class GatewayClient {
  constructor(private readonly transport: Transport) {}
  listModels(options?: RequestOptions) { return this.transport.request<ModelList>("GET", "/v1/models", undefined, options); }
  createChatCompletion(request: ChatCompletionRequest, options?: RequestOptions) { return this.transport.request<ChatCompletion>("POST", "/v1/chat/completions", request, options); }
  createChatCompletionStream(request: ChatCompletionRequest, options?: RequestOptions) { return this.transport.stream("/v1/chat/completions", { ...request, stream: true }, options); }
  createResponse(request: Record<string, unknown>, options?: RequestOptions) { return this.transport.request<Record<string, unknown>>("POST", "/v1/responses", request, options); }
  createResponseStream(request: Record<string, unknown>, options?: RequestOptions) { return this.transport.stream("/v1/responses", { ...request, stream: true }, options); }
  createEmbeddings(request: Record<string, unknown>, options?: RequestOptions) { return this.transport.request<Record<string, unknown>>("POST", "/v1/embeddings", request, options); }
  createAnthropicMessage(request: Record<string, unknown>, options?: RequestOptions) { return this.transport.request<Record<string, unknown>>("POST", "/anthropic/v1/messages", request, options); }
}

export class ManagementClient {
  constructor(private readonly transport: Transport) {}
  listWorkspaces(params: { cursor?: string; limit?: number } = {}, options?: RequestOptions) {
    const limit = params.limit ?? 50;
    if (!Number.isInteger(limit) || limit < 1 || limit > 100) throw new OwlVigilError("limit must be an integer between 1 and 100");
    const query = new URLSearchParams();
    if (params.cursor) query.set("cursor", params.cursor);
    query.set("limit", String(limit));
    return this.transport.request<WorkspaceList>("GET", `/workspaces?${query}`, undefined, options);
  }
  getUsageSummary(workspaceId: number, options: RequestOptions = {}) {
    requireWorkspaceId(workspaceId);
    return this.transport.request<UsageSummary>("GET", "/gateway/usage/summary", undefined, { ...options, workspaceId });
  }
  getRequestLog(workspaceId: number, requestIdValue: string, options: RequestOptions = {}) {
    requireWorkspaceId(workspaceId);
    if (!requestIdValue.trim()) throw new OwlVigilError("requestId is required");
    return this.transport.request<RequestLog>("GET", `/gateway/request-logs/${encodeURIComponent(requestIdValue)}`, undefined, { ...options, workspaceId });
  }
}

export class OAuth2Client {
  constructor(private readonly baseUrl: string, private readonly fetchImpl: typeof globalThis.fetch, private readonly timeoutMs: number) {}

  authorizationUrl(options: { clientId: string; redirectUri: string; scopes?: string[]; state?: string; codeChallenge?: string; codeChallengeMethod?: string; parameters?: Record<string, string> }): URL {
    const url = new URL("/oauth/authorize", this.baseUrl);
    url.searchParams.set("response_type", "code");
    url.searchParams.set("client_id", options.clientId);
    url.searchParams.set("redirect_uri", options.redirectUri);
    if (options.scopes?.length) url.searchParams.set("scope", options.scopes.join(" "));
    if (options.state) url.searchParams.set("state", options.state);
    if (options.codeChallenge) url.searchParams.set("code_challenge", options.codeChallenge);
    if (options.codeChallengeMethod) url.searchParams.set("code_challenge_method", options.codeChallengeMethod);
    for (const [key, value] of Object.entries(options.parameters ?? {})) url.searchParams.append(key, value);
    return url;
  }

  exchange(options: { clientId: string; clientSecret?: string; code: string; redirectUri: string; codeVerifier?: string }) {
    return this.token("/oauth/token", { grant_type: "authorization_code", client_id: options.clientId, client_secret: options.clientSecret, code: options.code, redirect_uri: options.redirectUri, code_verifier: options.codeVerifier });
  }

  refresh(options: { clientId: string; clientSecret?: string; refreshToken: string }) {
    return this.token("/oauth/token/refresh", { grant_type: "refresh_token", client_id: options.clientId, client_secret: options.clientSecret, refresh_token: options.refreshToken });
  }

  clientCredentials(options: { clientId: string; clientSecret: string; scopes?: string[] }) {
    return this.token("/oauth/token", { grant_type: "client_credentials", client_id: options.clientId, client_secret: options.clientSecret, scope: options.scopes?.join(" ") });
  }

  private async token(path: string, values: Record<string, string | undefined>): Promise<Record<string, unknown>> {
    const form = new URLSearchParams();
    for (const [key, value] of Object.entries(values)) if (value !== undefined && value !== "") form.set(key, value);
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(new OwlVigilError("OwlVigil OAuth request timed out")), this.timeoutMs);
    let response: Response;
    let text: string;
    try {
      response = await this.fetchImpl(new URL(path, this.baseUrl), { method: "POST", headers: { accept: "application/json", "content-type": "application/x-www-form-urlencoded" }, body: form, signal: controller.signal });
      text = await response.text();
    } finally {
      clearTimeout(timeout);
    }
    if (!response.ok) {
      let code = "";
      let message = response.statusText;
      try {
        const error = JSON.parse(text) as { error?: string; error_description?: string };
        code = error.error ?? "";
        message = error.error_description ?? message;
      } catch { /* Do not expose an unparsed response body. */ }
      throw new OwlVigilApiError(response.status, requestId(response.headers), code, message);
    }
    return JSON.parse(text) as Record<string, unknown>;
  }
}

export interface OwlVigilOptions {
  gatewayKey?: string | CredentialProvider;
  apiKey?: string | CredentialProvider;
  gatewayBaseUrl?: string;
  managementBaseUrl?: string;
  oauthBaseUrl?: string;
  timeoutMs?: number;
  maxRetries?: number;
  fetch?: typeof globalThis.fetch;
}

export class OwlVigil {
  readonly gateway: GatewayClient;
  readonly management: ManagementClient;
  readonly oauth2: OAuth2Client;
  constructor(options: OwlVigilOptions = {}) {
    const fetchImpl = options.fetch ?? globalThis.fetch;
    if (!fetchImpl) throw new OwlVigilError("A Fetch API implementation is required");
    const common = { timeoutMs: options.timeoutMs ?? 60_000, maxRetries: options.maxRetries ?? 2, fetch: fetchImpl };
    this.gateway = new GatewayClient(new Transport({ ...common, baseUrl: options.gatewayBaseUrl ?? "https://gateway.owlvigil.com", credential: provider(options.gatewayKey, "OWLVIGIL_GATEWAY_KEY"), unwrapEnvelope: false }));
    this.management = new ManagementClient(new Transport({ ...common, baseUrl: options.managementBaseUrl ?? "https://api.owlvigil.com/v1", credential: provider(options.apiKey, "OWLVIGIL_API_KEY"), unwrapEnvelope: true }));
    this.oauth2 = new OAuth2Client(options.oauthBaseUrl ?? "https://open.owlvigil.com", fetchImpl, common.timeoutMs);
  }
}

export function verifyWebhook(payload: Uint8Array, header: string, secret: string, options: { toleranceSeconds?: number; now?: Date } = {}): void {
  if (!header) throw new OwlVigilError("Webhook signature is required");
  if (!secret.trim()) throw new OwlVigilError("Webhook secret is required");
  let timestamp = 0;
  let signature = "";
  for (const part of header.split(",")) {
    const [key, value] = part.trim().split("=", 2);
    if (key === "t") timestamp = Number(value);
    if (key === "v1") signature = value ?? "";
  }
  if (!timestamp || !/^[0-9a-f]+$/i.test(signature) || signature.length % 2 !== 0) throw new OwlVigilError("Invalid webhook signature");
  const now = Math.floor((options.now ?? new Date()).getTime() / 1000);
  if (Math.abs(now - timestamp) > (options.toleranceSeconds ?? 300)) throw new OwlVigilError("Stale webhook timestamp");
  const expected = createHmac("sha256", secret).update(String(timestamp)).update(".").update(payload).digest();
  const actual = Buffer.from(signature, "hex");
  if (expected.length !== actual.length || !timingSafeEqual(expected, actual)) throw new OwlVigilError("Invalid webhook signature");
}

function provider(value: string | CredentialProvider | undefined, env: string): CredentialProvider {
  if (typeof value === "function") return value;
  return () => value ?? process.env[env] ?? "";
}

function requestId(headers: Headers): string { return headers.get("x-request-id") ?? headers.get("request-id") ?? ""; }
function isRecord(value: unknown): value is Record<string, unknown> { return typeof value === "object" && value !== null && !Array.isArray(value); }
function findEventBoundary(value: string): number {
  const matches = [value.indexOf("\n\n"), value.indexOf("\r\n\r\n"), value.indexOf("\r\r")].filter((index) => index >= 0);
  return matches.length ? Math.min(...matches) : -1;
}
function parseSseFrame(frame: string): { event: string; data: string; id?: string } | null {
  let event = "";
  let id: string | undefined;
  const data: string[] = [];
  for (const line of frame.split(/\r\n|\n|\r/)) {
    if (line.startsWith(":")) continue;
    const colon = line.indexOf(":");
    const field = colon < 0 ? line : line.slice(0, colon);
    let value = colon < 0 ? "" : line.slice(colon + 1);
    if (value.startsWith(" ")) value = value.slice(1);
    if (field === "event") event = value;
    else if (field === "id" && !value.includes("\0")) id = value;
    else if (field === "data") data.push(value);
  }
  if (!data.length) return null;
  return id === undefined ? { event, data: data.join("\n") } : { event, data: data.join("\n"), id };
}

function safeHeaders(headers: Record<string, string> | undefined): Record<string, string> {
  const result: Record<string, string> = {};
  const reserved = new Set(["authorization", "host", "content-length", "content-type", "idempotency-key"]);
  for (const [name, value] of Object.entries(headers ?? {})) {
    if (reserved.has(name.toLowerCase())) throw new OwlVigilError(`Header ${name} is managed by the SDK`);
    result[name] = value;
  }
  return result;
}

function requireWorkspaceId(value: number): void {
  if (!Number.isSafeInteger(value) || value <= 0) throw new OwlVigilError("workspaceId must be a positive integer");
}
