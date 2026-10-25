import { INTERNAL_HEADERS, type AuthContext } from '@novachat-enterprise-erp/contracts';
import { AppError, ServiceUnavailableError } from '../errors/app-error.js';
import { signInternalContext } from './internal-auth.js';

export interface InternalRequestOptions {
  method?: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';
  body?: unknown;
  headers?: Record<string, string>;
  context?: Partial<AuthContext>;
  requestId?: string;
  timeoutMs?: number;
}

export class InternalHttpClient {
  constructor(
    private readonly baseUrl: string,
    private readonly secret: string,
    private readonly serviceName: string,
  ) {}

  async request<T>(path: string, options: InternalRequestOptions = {}): Promise<T | null> {
    const context: AuthContext = { permissions: [], ...options.context, service: this.serviceName };
    const headers: Record<string, string> = {
      ...signInternalContext(context, this.secret),
      ...options.headers,
    };
    if (options.requestId) headers[INTERNAL_HEADERS.REQUEST_ID] = options.requestId;
    if (options.body !== undefined) headers['content-type'] = 'application/json';

    let response: Response;
    try {
      response = await fetch(new URL(path, this.baseUrl), {
        method: options.method ?? 'GET',
        headers,
        body: options.body === undefined ? undefined : JSON.stringify(options.body),
        signal: AbortSignal.timeout(options.timeoutMs ?? 5_000),
      });
    } catch {
      throw new ServiceUnavailableError(`Upstream ${this.baseUrl} is unreachable`);
    }

    if (response.status === 404) return null;
    if (response.status === 204) return null;
    const json = (await response.json().catch(() => null)) as
      | (T & { error?: { code: string; message: string; details?: unknown } })
      | null;
    if (!response.ok) {
      throw new AppError(
        response.status,
        json?.error?.code ?? 'UPSTREAM_ERROR',
        json?.error?.message ?? `Upstream responded with ${response.status}`,
        json?.error?.details,
      );
    }
    return json as T;
  }
}
