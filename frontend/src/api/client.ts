const API_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:4000';

export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public code?: string,
  ) {
    super(message);
  }
}

interface LoginResponse {
  token: string;
  role: 'admin' | 'user';
  rut?: string;
}

interface ScoreResponse {
  rut: string;
  score: number;
  fecha: string;
}

async function handle<T>(res: Response): Promise<T> {
  let body: unknown = null;
  try {
    body = await res.json();
  } catch {
    /* respuesta sin body */
  }

  if (!res.ok) {
    const b = body as { message?: string; error?: string } | null;
    throw new ApiError(b?.message ?? res.statusText, res.status, b?.error);
  }

  return body as T;
}

export async function login(username: string, password: string): Promise<LoginResponse> {
  const res = await fetch(`${API_URL}/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });
  return handle<LoginResponse>(res);
}

export async function fetchScore(rut: string, token: string): Promise<ScoreResponse> {
  const res = await fetch(`${API_URL}/score/${encodeURIComponent(rut)}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return handle<ScoreResponse>(res);
}
