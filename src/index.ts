import { createHmac, timingSafeEqual } from "node:crypto";
import { MANAGEMENT_OPERATIONS, type ManagementOperationId } from "./management-operations.js";
import { GeneratedManagementMethods } from "./management-methods.js";
import type { ManagementOperationBody, ManagementOperationData } from "./management-types.js";

export { MANAGEMENT_OPERATIONS } from "./management-operations.js";
export type { ManagementOperationDefinition, ManagementOperationId } from "./management-operations.js";
export * from "./management-types.js";

export const VERSION = "0.2.0";

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

export class OwlVigilOAuthError extends OwlVigilError {
  constructor(
    public readonly status: number,
    public readonly errorCode: string,
    public readonly errorDescription: string,
    public readonly errorUri = "",
  ) {
    super(`owlvigil oauth2: status=${status}${errorCode ? ` error=${errorCode}` : ""}${errorDescription ? ` description=${errorDescription}` : ""}`);
    this.name = "OwlVigilOAuthError";
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
        if (error instanceof OwlVigilError || options.signal?.aborted) throw error;
        if (attempt >= maxRetries || !this.retryable(method, -1, options)) throw transportError(error);
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
export interface Model { id: string; object?: string; owned_by?: string; [key: string]: unknown }
export interface ModelList { object: string; data: Model[] }
export interface ResponseRequest { model: string; input: unknown; stream?: boolean; [key: string]: unknown }
export interface GatewayResponse { id: string; object: string; model: string; output?: unknown; [key: string]: unknown }
export interface EmbeddingsRequest { model: string; input: unknown; [key: string]: unknown }
export interface EmbeddingData { object: string; index: number; embedding: number[] }
export interface EmbeddingsResponse { object: string; data: EmbeddingData[]; model: string; usage?: { prompt_tokens: number; total_tokens: number } }
export interface AnthropicMessage { role: string; content: unknown }
export interface AnthropicMessageRequest { model: string; messages: AnthropicMessage[]; max_tokens: number; stream?: boolean; [key: string]: unknown }
export interface AnthropicMessageResponse { id: string; type: string; role: string; model: string; content: unknown; [key: string]: unknown }
export interface SseEvent { event: string; data: string; id: string }
export interface Workspace { id: number; workspace_id?: number; name: string; slug?: string; status?: string; role?: string }
export interface PageInfo { next_cursor?: string; has_more?: boolean }
export interface WorkspaceList { items: Workspace[]; page_info: PageInfo }
export interface ListWorkspacesOptions { cursor?: string; limit?: number }
export type ManagementQuery = Record<string, string | number | boolean | Array<string | number | boolean> | null | undefined>;
export interface UsageSummary { workspace_id?: number; requests: number; tokens: number; cost: number; current_period?: string }
export interface RequestLog { request_id: string; model: string; status: string; status_code: number; total_tokens: number; total_cost: number; [key: string]: unknown }
export interface ManagementOperationRequest {
  path?: Record<string, string | number>;
  query?: Record<string, string | number | boolean | Array<string | number | boolean> | null | undefined>;
  body?: unknown;
  options?: RequestOptions;
}

export class GatewayClient {
  constructor(private readonly transport: Transport) {}
  listModels(options?: RequestOptions) { return this.transport.request<ModelList>("GET", "/v1/models", undefined, options); }
  getModel(model: string, options?: RequestOptions) {
    if (!model.trim()) throw new OwlVigilError("model is required");
    return this.transport.request<Model>("GET", `/v1/models/${encodeURIComponent(model)}`, undefined, options);
  }
  createChatCompletion(request: ChatCompletionRequest, options?: RequestOptions) { return this.transport.request<ChatCompletion>("POST", "/v1/chat/completions", request, options); }
  createChatCompletionStream(request: ChatCompletionRequest, options?: RequestOptions) { return this.transport.stream("/v1/chat/completions", { ...request, stream: true }, options); }
  createResponse(request: ResponseRequest, options?: RequestOptions) { return this.transport.request<GatewayResponse>("POST", "/v1/responses", request, options); }
  createResponseStream(request: ResponseRequest, options?: RequestOptions) { return this.transport.stream("/v1/responses", { ...request, stream: true }, options); }
  createEmbeddings(request: EmbeddingsRequest, options?: RequestOptions) { return this.transport.request<EmbeddingsResponse>("POST", "/v1/embeddings", request, options); }
  createAnthropicMessage(request: AnthropicMessageRequest, options?: RequestOptions) { return this.transport.request<AnthropicMessageResponse>("POST", "/anthropic/v1/messages", request, options); }
}

export class ManagementClient extends GeneratedManagementMethods {
  constructor(private readonly transport: Transport) { super(); }
  async listWorkspaces(params: ListWorkspacesOptions = {}, options?: RequestOptions): Promise<ApiResponse<WorkspaceList>> {
    const limit = params.limit ?? 50;
    if (!Number.isInteger(limit) || limit < 1 || limit > 100) throw new OwlVigilError("limit must be an integer between 1 and 100");
    const query = new URLSearchParams();
    if (params.cursor) query.set("cursor", params.cursor);
    query.set("limit", String(limit));
    const response = await this.transport.request<WorkspaceList | Workspace[]>("GET", `/workspaces?${query}`, undefined, options);
    if (Array.isArray(response.data)) {
      return { ...response, data: { items: response.data, page_info: {} } };
    }
    return { ...response, data: response.data as WorkspaceList };
  }
  /** Iterate through all workspace pages, yielding each workspace once. */
  async *listWorkspacesAll(options: RequestOptions & { pageSize?: number } = {}): AsyncGenerator<Workspace> {
    const { pageSize = 50, ...requestOptions } = options;
    let cursor: string | undefined;
    const seenCursors = new Set<string>();
    while (true) {
      const page = await this.listWorkspaces(cursor === undefined ? { limit: pageSize } : { cursor, limit: pageSize }, requestOptions);
      for (const workspace of page.data.items) yield workspace;
      const nextCursor = page.data.page_info.next_cursor;
      if (!page.data.page_info.has_more || !nextCursor) return;
      if (seenCursors.has(nextCursor)) throw new OwlVigilError("Management pagination returned a repeated cursor");
      seenCursors.add(nextCursor);
      cursor = nextCursor;
    }
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

  // Resource-oriented helpers mirror the Go SDK's common Management use cases.
  listProviders(query: ManagementQuery = {}, options?: RequestOptions) {
    return this.openApi("get_gateway_providers", { query, ...requestOptions(options) });
  }
  getProvider(providerId: string | number, options?: RequestOptions) {
    return this.openApi("get_gateway_providers_provider_id", { path: { provider_id: providerId }, ...requestOptions(options) });
  }
  createProvider(body: ManagementOperationBody["post_gateway_providers"], options?: RequestOptions) {
    return this.openApi("post_gateway_providers", { body, ...requestOptions(options) });
  }
  updateProvider(providerId: string | number, body: ManagementOperationBody["patch_gateway_providers_provider_id"], options?: RequestOptions) {
    return this.openApi("patch_gateway_providers_provider_id", { path: { provider_id: providerId }, body, ...requestOptions(options) });
  }
  listManagementModels(query: ManagementQuery = {}, options?: RequestOptions) {
    return this.openApi("get_gateway_models", { query, ...requestOptions(options) });
  }
  getManagementModel(modelId: string | number, options?: RequestOptions) {
    return this.openApi("get_gateway_models_model_id", { path: { model_id: modelId }, ...requestOptions(options) });
  }
  listGatewayKeys(query: ManagementQuery = {}, options?: RequestOptions) {
    return this.openApi("get_gateway_keys", { query, ...requestOptions(options) });
  }
  listWorkspaceMembers(workspaceId: string | number, query: ManagementQuery = {}, options?: RequestOptions) {
    return this.openApi("get_workspaces_workspace_id_members", { path: { workspace_id: workspaceId }, query, ...requestOptions(options) });
  }
  createWorkspaceMember(workspaceId: string | number, body: ManagementOperationBody["post_workspaces_workspace_id_members"], options?: RequestOptions) {
    return this.openApi("post_workspaces_workspace_id_members", { path: { workspace_id: workspaceId }, body, ...requestOptions(options) });
  }
  getWorkspace(workspaceId: string | number, options?: RequestOptions) {
    return this.openApi("get_workspaces_workspace_id", { path: { workspace_id: workspaceId }, ...requestOptions(options) });
  }
  updateWorkspace(workspaceId: string | number, body: ManagementOperationBody["patch_workspaces_workspace_id"], options?: RequestOptions) {
    return this.openApi("patch_workspaces_workspace_id", { path: { workspace_id: workspaceId }, body, ...requestOptions(options) });
  }
  getBillingOverview(options?: RequestOptions) {
    return this.openApi("get_billing_overview", requestOptions(options));
  }
  createGatewayKey(body: ManagementOperationBody["post_gateway_keys"], options?: RequestOptions) {
    return this.openApi("post_gateway_keys", { body, ...requestOptions(options) });
  }
  getGatewayKey(keyId: string | number, options?: RequestOptions) {
    return this.openApi("get_gateway_keys_key_id", { path: { key_id: keyId }, ...requestOptions(options) });
  }
  updateGatewayKey(keyId: string | number, body: ManagementOperationBody["patch_gateway_keys_key_id"], options?: RequestOptions) {
    return this.openApi("patch_gateway_keys_key_id", { path: { key_id: keyId }, body, ...requestOptions(options) });
  }
  deleteGatewayKey(keyId: string | number, options?: RequestOptions) {
    return this.openApi("delete_gateway_keys_key_id", { path: { key_id: keyId }, ...requestOptions(options) });
  }
  enableGatewayKey(keyId: string | number, options?: RequestOptions) {
    return this.openApi("post_gateway_keys_key_id_enable", { path: { key_id: keyId }, ...requestOptions(options) });
  }
  disableGatewayKey(keyId: string | number, options?: RequestOptions) {
    return this.openApi("post_gateway_keys_key_id_disable", { path: { key_id: keyId }, ...requestOptions(options) });
  }
  rotateGatewayKey(keyId: string | number, options?: RequestOptions) {
    return this.openApi("post_gateway_keys_key_id_rotate", { path: { key_id: keyId }, ...requestOptions(options) });
  }
  listWebhookEndpoints(query: ManagementQuery = {}, options?: RequestOptions) {
    return this.openApi("get_webhook-endpoints", { query, ...requestOptions(options) });
  }
  createWebhookEndpoint(body: ManagementOperationBody["post_webhook-endpoints"], options?: RequestOptions) {
    return this.openApi("post_webhook-endpoints", { body, ...requestOptions(options) });
  }
  getWebhookEndpoint(endpointId: string | number, options?: RequestOptions) {
    return this.openApi("get_webhook-endpoints_endpoint_id", { path: { endpoint_id: endpointId }, ...requestOptions(options) });
  }
  updateWebhookEndpoint(endpointId: string | number, body: ManagementOperationBody["patch_webhook-endpoints_endpoint_id"], options?: RequestOptions) {
    return this.openApi("patch_webhook-endpoints_endpoint_id", { path: { endpoint_id: endpointId }, body, ...requestOptions(options) });
  }
  deleteWebhookEndpoint(endpointId: string | number, options?: RequestOptions) {
    return this.openApi("delete_webhook-endpoints_endpoint_id", { path: { endpoint_id: endpointId }, ...requestOptions(options) });
  }
  enableWebhookEndpoint(endpointId: string | number, options?: RequestOptions) {
    return this.openApi("post_webhook-endpoints_endpoint_id_enable", { path: { endpoint_id: endpointId }, ...requestOptions(options) });
  }
  disableWebhookEndpoint(endpointId: string | number, options?: RequestOptions) {
    return this.openApi("post_webhook-endpoints_endpoint_id_disable", { path: { endpoint_id: endpointId }, ...requestOptions(options) });
  }
  rotateWebhookSecret(endpointId: string | number, options?: RequestOptions) {
    return this.openApi("post_webhook-endpoints_endpoint_id_rotate-secret", { path: { endpoint_id: endpointId }, ...requestOptions(options) });
  }
  listWorkspaceRoles(workspaceId: string | number, query: ManagementQuery = {}, options?: RequestOptions) {
    return this.openApi("get_workspaces_workspace_id_roles", { path: { workspace_id: workspaceId }, query, ...requestOptions(options) });
  }
  createWorkspaceRole(workspaceId: string | number, body: ManagementOperationBody["post_workspaces_workspace_id_roles"], options?: RequestOptions) {
    return this.openApi("post_workspaces_workspace_id_roles", { path: { workspace_id: workspaceId }, body, ...requestOptions(options) });
  }
  getWorkspaceRole(workspaceId: string | number, roleId: string | number, options?: RequestOptions) {
    return this.openApi("get_workspaces_workspace_id_roles_role_id", { path: { workspace_id: workspaceId, role_id: roleId }, ...requestOptions(options) });
  }
  updateWorkspaceRole(workspaceId: string | number, roleId: string | number, body: ManagementOperationBody["patch_workspaces_workspace_id_roles_role_id"], options?: RequestOptions) {
    return this.openApi("patch_workspaces_workspace_id_roles_role_id", { path: { workspace_id: workspaceId, role_id: roleId }, body, ...requestOptions(options) });
  }
  deleteWorkspaceRole(workspaceId: string | number, roleId: string | number, options?: RequestOptions) {
    return this.openApi("delete_workspaces_workspace_id_roles_role_id", { path: { workspace_id: workspaceId, role_id: roleId }, ...requestOptions(options) });
  }
  listWorkspaceTeams(workspaceId: string | number, query: ManagementQuery = {}, options?: RequestOptions) {
    return this.openApi("get_workspaces_workspace_id_teams", { path: { workspace_id: workspaceId }, query, ...requestOptions(options) });
  }
  createWorkspaceTeam(workspaceId: string | number, body: ManagementOperationBody["post_workspaces_workspace_id_teams"], options?: RequestOptions) {
    return this.openApi("post_workspaces_workspace_id_teams", { path: { workspace_id: workspaceId }, body, ...requestOptions(options) });
  }
  getSubscription(options?: RequestOptions) {
    return this.openApi("get_billing_subscription", requestOptions(options));
  }
  cancelSubscription(options?: RequestOptions) {
    return this.openApi("post_billing_subscription_cancel", requestOptions(options));
  }
  reactivateSubscription(options?: RequestOptions) {
    return this.openApi("post_billing_subscription_reactivate", requestOptions(options));
  }

  /** Execute any operation in the published OpenAPI Management catalog. */
  openApi<K extends ManagementOperationId>(operationId: K, request: ManagementOperationRequest & { body?: ManagementOperationBody[K] } = {}): Promise<ApiResponse<ManagementOperationData[K]>> {
    const operation = MANAGEMENT_OPERATIONS[operationId];
    return this.request<ManagementOperationData[K]>(operation.method, operation.path, request);
  }

  request<T = unknown>(method: string, path: string, request: ManagementOperationRequest = {}): Promise<ApiResponse<T>> {
    if (!["GET", "POST", "PUT", "PATCH", "DELETE", "HEAD", "OPTIONS"].includes(method)) {
      throw new OwlVigilError("Unsupported Management HTTP method: " + method);
    }
    const resolvedPath = resolveManagementPath(path, request.path);
    const query = new URLSearchParams();
    for (const [key, value] of Object.entries(request.query ?? {})) {
      if (value === undefined || value === null) continue;
      for (const item of Array.isArray(value) ? value : [value]) query.append(key, String(item));
    }
    const suffix = query.toString() ? "?" + query.toString() : "";
    return this.transport.request<T>(method, resolvedPath + suffix, request.body, request.options);
  }
}

export class OAuth2Client {
  constructor(private readonly baseUrl: string, private readonly fetchImpl: typeof globalThis.fetch, private readonly timeoutMs: number) {}

  authorizationUrl(options: { clientId: string; redirectUri: string; scopes?: string[]; state?: string; codeChallenge?: string; codeChallengeMethod?: string; parameters?: Record<string, string> }): URL {
    const url = resolveUrl(this.baseUrl, "oauth/authorize");
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

  exchange(options: { clientId: string; clientSecret?: string; code: string; redirectUri: string; codeVerifier?: string }): Promise<OAuthTokenResponse> {
    return this.token("/oauth/token", { grant_type: "authorization_code", client_id: options.clientId, client_secret: options.clientSecret, code: options.code, redirect_uri: options.redirectUri, code_verifier: options.codeVerifier });
  }

  refresh(options: { clientId: string; clientSecret?: string; refreshToken: string }): Promise<OAuthTokenResponse> {
    return this.token("/oauth/token/refresh", { grant_type: "refresh_token", client_id: options.clientId, client_secret: options.clientSecret, refresh_token: options.refreshToken });
  }

  clientCredentials(options: { clientId: string; clientSecret: string; scopes?: string[] }): Promise<OAuthTokenResponse> {
    return this.token("/oauth/token", { grant_type: "client_credentials", client_id: options.clientId, client_secret: options.clientSecret, scope: options.scopes?.join(" ") });
  }

  async revoke(token: string): Promise<void> {
    if (!token.trim()) throw new OwlVigilError("OAuth token is required");
    await this.token("/oauth/revoke", { token }, true);
  }

  async userInfo(accessToken: string): Promise<OAuthUserInfo> {
    if (!accessToken.trim()) throw new OwlVigilError("OAuth access token is required");
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(new OwlVigilError("OwlVigil OAuth request timed out")), this.timeoutMs);
    try {
      const response = await this.fetchImpl(resolveUrl(this.baseUrl, "/oauth/userinfo"), { method: "GET", headers: { accept: "application/json", authorization: `Bearer ${accessToken}` }, signal: controller.signal });
      const text = await response.text();
      if (!response.ok) throw oauthError(response.status, response.statusText, text);
      try {
        return JSON.parse(text) as OAuthUserInfo;
      } catch {
        const responseRequestId = requestId(response.headers);
        throw new OwlVigilError(`owlvigil: invalid OAuth JSON response status=${response.status}${responseRequestId ? ` request_id=${responseRequestId}` : ""}`);
      }
    } finally {
      clearTimeout(timeout);
    }
  }

  private async token(path: string, values: Record<string, string | undefined>, allowEmpty = false): Promise<OAuthTokenResponse> {
    const form = new URLSearchParams();
    for (const [key, value] of Object.entries(values)) if (value !== undefined && value !== "") form.set(key, value);
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(new OwlVigilError("OwlVigil OAuth request timed out")), this.timeoutMs);
    let response: Response;
    let text: string;
    try {
      response = await this.fetchImpl(resolveUrl(this.baseUrl, path), { method: "POST", headers: { accept: "application/json", "content-type": "application/x-www-form-urlencoded" }, body: form, signal: controller.signal });
      text = await response.text();
    } finally {
      clearTimeout(timeout);
    }
    if (!response.ok) {
      throw oauthError(response.status, response.statusText, text);
    }
    if (!text.trim() && allowEmpty) return {};
    try {
      return JSON.parse(text) as OAuthTokenResponse;
    } catch {
      const responseRequestId = requestId(response.headers);
      throw new OwlVigilError(`owlvigil: invalid OAuth JSON response status=${response.status}${responseRequestId ? ` request_id=${responseRequestId}` : ""}`);
    }
  }
}

export interface OAuthTokenResponse { access_token?: string; refresh_token?: string; token_type?: string; expires_in?: number; scope?: string; [key: string]: unknown }
export interface OAuthUserInfo { sub: string; email?: string; name?: string; picture?: string; [key: string]: unknown }

export interface OwlVigilOptions {
  gatewayKey?: string | CredentialProvider;
  apiKey?: string | CredentialProvider;
  gatewayBaseUrl?: string;
  managementBaseUrl?: string;
  oauthBaseUrl?: string;
  environment?: OwlVigilEnvironment;
  timeoutMs?: number;
  maxRetries?: number;
  fetch?: typeof globalThis.fetch;
}

export type OwlVigilEnvironment = "production" | "staging" | "local";
export const OwlVigilEnvironment = {
  Production: "production",
  Staging: "staging",
  Local: "local",
} as const satisfies Record<string, OwlVigilEnvironment>;

export class OwlVigil {
  readonly gateway: GatewayClient;
  readonly management: ManagementClient;
  readonly oauth2: OAuth2Client;
  constructor(options: OwlVigilOptions = {}) {
    const fetchImpl = options.fetch ?? globalThis.fetch;
    if (!fetchImpl) throw new OwlVigilError("A Fetch API implementation is required");
    const environment = resolveEnvironment(options.environment ?? process.env.OWLVIGIL_ENV ?? "production");
    const common = { timeoutMs: options.timeoutMs ?? 60_000, maxRetries: options.maxRetries ?? 2, fetch: fetchImpl };
    this.gateway = new GatewayClient(new Transport({ ...common, baseUrl: resolveEnvironmentUrl(options.gatewayBaseUrl ?? "https://gateway.owlvigil.com", environment), credential: provider(options.gatewayKey, "OWLVIGIL_GATEWAY_KEY"), unwrapEnvelope: false }));
    this.management = new ManagementClient(new Transport({ ...common, baseUrl: resolveEnvironmentUrl(options.managementBaseUrl ?? "https://api.owlvigil.com/v1", environment), credential: provider(options.apiKey, "OWLVIGIL_API_KEY"), unwrapEnvelope: true }));
    this.oauth2 = new OAuth2Client(resolveEnvironmentUrl(options.oauthBaseUrl ?? "https://open.owlvigil.com", environment), fetchImpl, common.timeoutMs);
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

function resolveEnvironment(value: string): OwlVigilEnvironment {
  if (value === "production" || value === "staging" || value === "local") return value;
  throw new OwlVigilError(`Unsupported OwlVigil environment: ${value}`);
}

function resolveEnvironmentUrl(baseUrl: string, environment: OwlVigilEnvironment): string {
  if (environment === "production") return baseUrl;
  const url = new URL(baseUrl);
  if (environment === "staging") {
    if (url.hostname === "gateway.owlvigil.com") url.hostname = "staginggateway.owlvigil.com";
    else if (url.hostname === "api.owlvigil.com" || url.hostname === "open.owlvigil.com") url.hostname = "stagingapi.owlvigil.com";
    return url.toString().replace(/\/$/, "");
  }
  if (url.hostname === "gateway.owlvigil.com" || url.hostname === "staginggateway.owlvigil.com") return "http://localhost:8080";
  if (url.pathname.startsWith("/v1") || url.hostname === "api.owlvigil.com") return "http://localhost:8081/v1";
  if (url.hostname === "open.owlvigil.com" || url.hostname === "stagingapi.owlvigil.com") return "http://localhost:8081";
  return "http://localhost:8080";
}

function requestOptions(options?: RequestOptions): { options?: RequestOptions } {
  return options === undefined ? {} : { options };
}

function requestId(headers: Headers): string { return headers.get("x-request-id") ?? headers.get("request-id") ?? ""; }
function resolveUrl(baseUrl: string, path: string): URL {
  const base = baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`;
  return new URL(path.replace(/^\/+/, ""), base);
}
function resolveManagementPath(path: string, params: Record<string, string | number> | undefined): string {
  return path.replace(/\{([^}]+)\}/g, (_, name: string) => {
    const value = params?.[name];
    if (value === undefined) throw new OwlVigilError("Missing Management path parameter: " + name);
    return encodeURIComponent(String(value));
  });
}
function transportError(error: unknown): OwlVigilError {
  const message = error instanceof Error ? error.message : String(error);
  return new OwlVigilError(`owlvigil: transport request failed${message ? `: ${message}` : ""}`);
}
function oauthError(status: number, statusText: string, text: string): OwlVigilOAuthError {
  let errorCode = "";
  let errorDescription = statusText;
  let errorUri = "";
  try {
    const parsed = JSON.parse(text) as { error?: string; error_description?: string; error_uri?: string };
    errorCode = parsed.error ?? "";
    errorDescription = parsed.error_description ?? errorDescription;
    errorUri = parsed.error_uri ?? "";
  } catch { /* Do not expose an unparsed response body. */ }
  return new OwlVigilOAuthError(status, errorCode, errorDescription, errorUri);
}
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
