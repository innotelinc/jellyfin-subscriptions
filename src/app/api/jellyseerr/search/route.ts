import { NextRequest, NextResponse } from 'next/server';
import { searchMedia, JellyseerrError } from '@/lib/jellyseerr/client';
import { hasJellyseerrConfig } from '@/lib/env';

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  if (!hasJellyseerrConfig()) {
    return NextResponse.json(
      { error: 'JellySeerr is not configured' },
      { status: 503 },
    );
  }

  const query = request.nextUrl.searchParams.get('query');
  if (!query) {
    return NextResponse.json({ error: 'Query parameter is required' }, { status: 400 });
  }

  try {
    const results = await searchMedia(query);
    return NextResponse.json(results);
  } catch (err) {
    if (err instanceof JellyseerrError) {
      return NextResponse.json(
        { error: 'JellySeerr search failed', details: err.message },
        { status: err.status >= 400 && err.status < 600 ? err.status : 502 },
      );
    }
    console.error('[JellySeerr] Search error:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 },
    );
  }
}
