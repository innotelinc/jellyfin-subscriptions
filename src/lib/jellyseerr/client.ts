import { env } from '@/lib/env';

export interface JellyseerrMedia {
  id: number;
  mediaType: 'movie' | 'tv';
  title?: string;
  name?: string;
  overview?: string;
  posterPath: string | null;
  backdropPath: string | null;
  releaseDate?: string;
  firstAirDate?: string;
  voteAverage: number;
  status?: string;
  mediaInfo?: unknown;
}

export interface JellyseerrSearchResult {
  page: number;
  totalResults: number;
  totalPages: number;
  results: JellyseerrMedia[];
}

export interface JellyseerrDiscoverResult {
  page: number;
  totalResults: number;
  totalPages: number;
  results: JellyseerrMedia[];
}

function headers() {
  return {
    'X-Api-Key': env.jellyseerrApiKey!,
    'Content-Type': 'application/json',
  };
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${env.jellyseerrBaseUrl}${path}`, {
    ...init,
    headers: {
      ...headers(),
      ...init?.headers,
    },
    next: { revalidate: 60 },
  });

  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new JellyseerrError(res.status, body);
  }

  return res.json() as Promise<T>;
}

export class JellyseerrError extends Error {
  status: number;
  body: string;

  constructor(status: number, body: string) {
    super(`JellySeerr API error ${status}: ${body.slice(0, 200)}`);
    this.status = status;
    this.body = body;
  }
}

export async function searchMedia(query: string): Promise<JellyseerrSearchResult> {
  const url = new URL(`${env.jellyseerrBaseUrl}/api/v1/search`);
  url.searchParams.set('query', query);
  url.searchParams.set('page', '1');

  const res = await fetch(url.toString(), {
    headers: headers(),
    next: { revalidate: 0 },
  });

  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new JellyseerrError(res.status, body);
  }

  return res.json() as Promise<JellyseerrSearchResult>;
}

export async function discoverMovies(): Promise<JellyseerrDiscoverResult> {
  return request<JellyseerrDiscoverResult>('/api/v1/discover/movies?page=1');
}

export async function discoverTv(): Promise<JellyseerrDiscoverResult> {
  return request<JellyseerrDiscoverResult>('/api/v1/discover/tv?page=1');
}

export async function getMediaDetails(
  mediaType: 'movie' | 'tv',
  id: number,
): Promise<JellyseerrMedia> {
  return request<JellyseerrMedia>(`/api/v1/${mediaType}/${id}`);
}

export async function submitRequest(
  mediaId: number,
  mediaType: 'movie' | 'tv',
  email?: string,
): Promise<unknown> {
  return request('/api/v1/request', {
    method: 'POST',
    body: JSON.stringify({
      mediaId,
      mediaType,
      ...(email ? { email } : {}),
    }),
  });
}
