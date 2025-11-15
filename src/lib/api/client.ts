const DEFAULT_API_BASE = 'http://localhost:4000';
const envBase = process.env.NEXT_PUBLIC_API_URL?.replace(/\/$/, '');
const API_BASE = envBase && envBase.length > 0 ? envBase : DEFAULT_API_BASE;

const buildUrl = (input: string) => {
  if (input.startsWith('http')) return input;
  if (input.startsWith('/')) return `${API_BASE}${input}`;
  return `${API_BASE}/${input}`;
};

export async function apiFetch<T>(input: string, init?: RequestInit): Promise<T> {
  const response = await fetch(buildUrl(input), init);
  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || 'API request failed');
  }
  return response.json() as Promise<T>;
}
