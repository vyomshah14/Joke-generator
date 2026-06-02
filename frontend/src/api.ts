export type AuthResponse = {
  access_token: string;
  token_type: 'Bearer';
};

export type MeResponse = {
  username: string;
};

export type LoginRequest = {
  username: string;
  password: string;
};

export type RegisterRequest = {
  username: string;
  password: string;
};

export type JokesListResponse = {
  jokes: string[];
};

export type RandomJokeResponse = {
  joke: string;
};

export type AddJokeRequest = {
  joke_text: string;
};

export type AddJokeResponse = {
  added: boolean;
  message: string;
};

export type DeleteJokeResponse = {
  removed: string;
};

export type StatsResponse = {
  top: Array<{
    joke: string;
    count: number;
  }>;
};

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000';

async function apiFetch<T>(
  path: string,
  init: RequestInit & { headers?: Record<string, string> } = {},
  token?: string,
): Promise<T> {
  const url = `${API_BASE_URL}${path}`;
  const headers: Record<string, string> = {
    ...(init.headers ?? {}),
  };

  if (token) headers.Authorization = `Bearer ${token}`;

  if (init.body && !(init.body instanceof FormData)) {
    headers['Content-Type'] = headers['Content-Type'] ?? 'application/json';
  }

  const res = await fetch(url, { ...init, headers });
  const contentType = res.headers.get('content-type') ?? '';

  if (!res.ok) {
    const message =
      contentType.includes('application/json')
        ? (await res.json()).detail ?? (await res.text())
        : await res.text();
    throw new Error(typeof message === 'string' ? message : 'Request failed');
  }

  if (contentType.includes('application/json')) {
    return (await res.json()) as T;
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (await res.text()) as any as T;
}

export const api = {
  login: async (req: LoginRequest) =>
    apiFetch<AuthResponse>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(req),
    }),

  register: async (req: RegisterRequest) =>
    apiFetch<{ ok: boolean }>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(req),
    }),

  me: async (token: string) => apiFetch<MeResponse>('/api/auth/me', {}, token),

  jokes: {
    random: async (token: string | undefined) =>
      apiFetch<RandomJokeResponse>('/api/jokes/random', {}, token),

    list: async (token: string | undefined) =>
      apiFetch<JokesListResponse>('/api/jokes', {}, token),

    add: async (token: string | undefined, req: AddJokeRequest) =>
      apiFetch<AddJokeResponse>('/api/jokes', { method: 'POST', body: JSON.stringify(req) }, token),

    delete: async (token: string | undefined, index: number) =>
      apiFetch<DeleteJokeResponse>(`/api/jokes/${index}`, { method: 'DELETE' }, token),

    stats: async (token: string | undefined) =>
      apiFetch<StatsResponse>('/api/jokes/stats', {}, token),
  },
};

