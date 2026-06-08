import { NextResponse } from 'next/server';
import { discoverMovies, discoverTv, JellyseerrError } from '@/lib/jellyseerr/client';
import { hasJellyseerrConfig } from '@/lib/env';

export const dynamic = 'force-dynamic';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ type: string }> },
) {
  if (!hasJellyseerrConfig()) {
    return NextResponse.json(
      { error: 'JellySeerr is not configured' },
      { status: 503 },
    );
  }

  const { type } = await params;

  if (type !== 'movies' && type !== 'tv') {
    return NextResponse.json({ error: 'Type must be "movies" or "tv"' }, { status: 400 });
  }

  try {
    const results = type === 'movies' ? await discoverMovies() : await discoverTv();
    return NextResponse.json(results);
  } catch (err) {
    if (err instanceof JellyseerrError) {
      return NextResponse.json(
        { error: 'JellySeerr discover failed', details: err.message },
        { status: err.status >= 400 && err.status < 600 ? err.status : 502 },
      );
    }
    console.error('[JellySeerr] Discover error:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
