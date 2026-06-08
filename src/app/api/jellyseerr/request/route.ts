import { NextRequest, NextResponse } from 'next/server';
import { submitRequest, JellyseerrError } from '@/lib/jellyseerr/client';
import { hasJellyseerrConfig } from '@/lib/env';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  if (!hasJellyseerrConfig()) {
    return NextResponse.json(
      { error: 'JellySeerr is not configured' },
      { status: 503 },
    );
  }

  let body: { mediaId?: number; mediaType?: string; email?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const { mediaId, mediaType, email } = body;

  if (!mediaId || !mediaType) {
    return NextResponse.json(
      { error: 'mediaId and mediaType are required' },
      { status: 400 },
    );
  }

  if (mediaType !== 'movie' && mediaType !== 'tv') {
    return NextResponse.json(
      { error: 'mediaType must be "movie" or "tv"' },
      { status: 400 },
    );
  }

  try {
    const result = await submitRequest(mediaId, mediaType, email);
    return NextResponse.json(result);
  } catch (err) {
    if (err instanceof JellyseerrError) {
      return NextResponse.json(
        { error: 'JellySeerr request failed', details: err.message },
        { status: err.status >= 400 && err.status < 600 ? err.status : 502 },
      );
    }
    console.error('[JellySeerr] Request error:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
