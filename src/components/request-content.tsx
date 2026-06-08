import Image from 'next/image';

import { discoverMovies, discoverTv } from '@/lib/jellyseerr/client';
import { env } from '@/lib/env';

interface MediaItem {
  id: number;
  mediaType: 'movie' | 'tv';
  title?: string;
  name?: string;
  posterPath: string | null;
  releaseDate?: string;
  firstAirDate?: string;
  voteAverage: number;
  mediaInfo?: unknown;
}

export async function RequestContentSection() {
  const mixed: MediaItem[] = [];

  try {
    const [moviesData, tvData] = await Promise.all([
      discoverMovies().catch(() => null),
      discoverTv().catch(() => null),
    ]);

    const movies = (moviesData?.results || []).slice(0, 10).map((m) => ({
      ...m,
      mediaType: 'movie' as const,
    }));
    const tv = (tvData?.results || []).slice(0, 10).map((t) => ({
      ...t,
      mediaType: 'tv' as const,
    }));

    for (let i = 0; i < Math.max(movies.length, tv.length); i++) {
      if (movies[i]) mixed.push(movies[i]);
      if (tv[i]) mixed.push(tv[i]);
    }
  } catch {
    // Silently fail — section will show empty state
  }

  return (
    <section id="request" className="relative z-1 mx-auto max-w-6xl px-4 py-20">
      <h2 className="mb-2 text-center text-3xl font-bold tracking-tight text-white">
        Request Content
      </h2>
      <p className="mb-10 text-center text-zinc-400">
        Can&apos;t find what you&apos;re looking for? Request it and we&apos;ll add it to the
        library.
      </p>

      {mixed.length === 0 ? (
        <div className="rounded-2xl border border-white/10 bg-white/5 p-12 text-center text-zinc-500">
          <p>Trending content is loading. Try searching below!</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {mixed.map((item) => (
            <MediaCard key={`${item.mediaType}-${item.id}`} item={item} />
          ))}
        </div>
      )}

      <div className="mt-10 text-center">
        <a
          href={env.jellyseerrBaseUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 rounded-xl bg-red-600 px-6 py-3 text-sm font-semibold text-white transition-all hover:-translate-y-0.5 hover:bg-red-500 hover:shadow-lg hover:shadow-red-500/25"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M12 5v14M5 12h14" />
          </svg>
          Browse &amp; Request More
        </a>
      </div>
    </section>
  );
}

function MediaCard({ item }: { item: MediaItem }) {
  const title = item.title || item.name || 'Unknown';
  const year = (item.releaseDate || item.firstAirDate || '').substring(0, 4);
  const rating = item.voteAverage ? item.voteAverage.toFixed(1) : null;
  const hasMediaInfo = item.mediaInfo != null;

  return (
    <a
      href={`${env.jellyseerrBaseUrl}/${item.mediaType}/${item.id}`}
      target="_blank"
      rel="noopener noreferrer"
      className="group relative overflow-hidden rounded-xl border border-white/10 bg-white/5 transition-all hover:-translate-y-1 hover:border-red-500/30 hover:shadow-lg hover:shadow-red-500/10"
    >
      <div className="aspect-[2/3] w-full overflow-hidden bg-gradient-to-br from-zinc-800 to-zinc-900">
        {item.posterPath ? (
          <div className="relative h-full w-full">
            <Image
              src={`https://image.tmdb.org/t/p/w300${item.posterPath}`}
              alt={title}
              fill
              className="object-cover transition-transform group-hover:scale-105"
              loading="lazy"
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 25vw, 20vw"
            />
          </div>
        ) : (
          <div className="flex h-full items-center justify-center text-4xl opacity-30">🎬</div>
        )}
        <div className="absolute inset-0 flex items-center justify-center bg-red-600/80 opacity-0 transition-opacity group-hover:opacity-100">
          <span className="flex items-center gap-2 rounded-lg bg-white px-3 py-1.5 text-xs font-bold text-red-600">
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 5v14M5 12h14" />
            </svg>
            {hasMediaInfo ? 'View' : 'Request'}
          </span>
        </div>
        {hasMediaInfo && (
          <div
            className="absolute top-2 right-2 h-2.5 w-2.5 rounded-full bg-green-500 shadow-lg shadow-green-500/50"
            title="Available on server"
          />
        )}
      </div>
      <div className="p-3">
        <div className="truncate text-sm font-semibold text-white">{title}</div>
        <div className="mt-0.5 flex items-center gap-2 text-xs text-zinc-500">
          {year && <span>{year}</span>}
          {rating && (
            <span className="flex items-center gap-0.5 text-yellow-500">
              <svg width="10" height="10" viewBox="0 0 24 24" fill="currentColor">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
              </svg>
              {rating}
            </span>
          )}
        </div>
      </div>
    </a>
  );
}
