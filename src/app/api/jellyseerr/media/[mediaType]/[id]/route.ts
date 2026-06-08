import { NextResponse } from 'next/server';
import { getMediaDetails, JellyseerrError } from '@/lib/jellyseerr/client';
import { hasJellyseerrConfig } from '@/lib/env';

export const dynamic = 'force-dynamic';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ mediaType: string; id: string }> },
) {
  if (!hasJellyseerrConfig()) {
    return NextResponse.json(
      { error: 'JellySeerr is not configured' },
      { status: 503 },
    );
  }

  const { mediaType, id } = await params;

  if (mediaType !== 'movie' && mediaType !== 'tv') {
    return NextResponse.json(
      { error: 'mediaType must be "movie" or "tv"' },
      { status: 400 },
    );
  }

  const mediaId = parseInt(id, 10);
  if (isNaN(mediaId)) {
    return NextResponse.json({ error: 'Invalid media ID' }, { status: 400 });
  }

  try {
    const result = await getMediaDetails(mediaType, mediaId);
    return NextResponse.json(result);
  } catch (err) {
    if (err instanceof JellyseerrError) {
      return NextResponse.json(
        { error: 'Failed to fetch media details', details: err.message },
        { status: err.status >= 400 && err.status < 600 ? err.status : 502 },
      );
    }
    console.error('[JellySeerr] Media details error:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
