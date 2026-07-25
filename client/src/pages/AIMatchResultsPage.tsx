import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ArrowLeft, Sparkles, Image, Tag, Palette, FolderOpen, MapPin, Calendar } from 'lucide-react';
import { lostItemsApi } from '@/lib/services';
import { Skeleton } from '@/components/ui/Loading';
import { EmptyState } from '@/components/ui/EmptyState';
import type { MatchResult } from '@/types';

function ScoreBar({ label, value, icon }: { label: string; value: number; icon: React.ReactNode }) {
  const pct = Math.round(value);
  const color = pct >= 70 ? 'bg-green-500' : pct >= 40 ? 'bg-yellow-500' : 'bg-gray-400';
  return (
    <div className="flex items-center gap-2">
      <span className="flex w-5 items-center justify-center text-[var(--color-text-secondary)]">{icon}</span>
      <span className="w-24 text-xs text-[var(--color-text-secondary)]">{label}</span>
      <div className="h-2 flex-1 overflow-hidden rounded-full bg-gray-200 dark:bg-gray-700">
        <div className={`h-full rounded-full ${color}`} style={{ width: `${pct}%` }} />
      </div>
      <span className="w-8 text-right text-xs font-medium">{pct}%</span>
    </div>
  );
}

export default function AIMatchResultsPage() {
  const { id } = useParams<{ id: string }>();

  const { data, isLoading } = useQuery({
    queryKey: ['lost-item-matches', id],
    queryFn: () => lostItemsApi.getMatches(id!),
    enabled: !!id,
  });

  const matches = data?.data?.data?.matches ?? [];

  if (isLoading) {
    return <div className="space-y-4"><Skeleton className="h-8 w-64" /><Skeleton className="h-48 w-full" /><Skeleton className="h-48 w-full" /></div>;
  }

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <Link to={`/lost-items/${id}`} className="inline-flex items-center gap-1 text-sm text-[var(--color-text-secondary)] hover:text-primary-600">
        <ArrowLeft size={14} /> Back to Item
      </Link>

      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary-100 text-primary-600 dark:bg-primary-900/40">
          <Sparkles size={20} />
        </div>
        <div>
          <h1 className="text-2xl font-bold">AI Match Results</h1>
          <p className="text-sm text-[var(--color-text-secondary)]">{matches.length} potential match{matches.length !== 1 ? 'es' : ''} found</p>
        </div>
      </div>

      {matches.length === 0 ? (
        <EmptyState title="No matches found" description="Our AI couldn't find any matching found items. Try again later as new items are reported." />
      ) : (
        <div className="space-y-4">
          {matches.map((match: MatchResult, index: number) => (
            <div key={match.foundItem._id} className="card">
              <div className="flex flex-col gap-4 sm:flex-row">
                <div className="h-24 w-24 shrink-0 overflow-hidden rounded-lg bg-gray-100 dark:bg-gray-800">
                  {match.foundItem.images?.[0] ? (
                    <img src={match.foundItem.images[0]} alt={match.foundItem.title} className="h-full w-full object-cover" loading="lazy" />
                  ) : (
                    <div className="flex h-full items-center justify-center text-xs text-[var(--color-text-secondary)]">No Image</div>
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-xs font-medium text-primary-600">Match #{index + 1}</span>
                      <h3 className="font-semibold">{match.foundItem.title}</h3>
                      <p className="text-sm text-[var(--color-text-secondary)]">{match.foundItem.location} • {match.foundItem.category}</p>
                    </div>
                    <div className="text-right">
                      <div className={`inline-flex flex-col items-center rounded-xl px-3 py-2 ${
                        match.scores.overallScore >= 70 ? 'bg-green-100 dark:bg-green-900/30' :
                        match.scores.overallScore >= 40 ? 'bg-yellow-100 dark:bg-yellow-900/30' :
                        'bg-gray-100 dark:bg-gray-800'
                      }`}>
                        <span className={`text-lg font-bold ${
                          match.scores.overallScore >= 70 ? 'text-green-700 dark:text-green-300' :
                          match.scores.overallScore >= 40 ? 'text-yellow-700 dark:text-yellow-300' :
                          'text-gray-700 dark:text-gray-300'
                        }`}>
                          {Math.round(match.scores.overallScore)}%
                        </span>
                        <span className="text-[10px] text-[var(--color-text-secondary)]">Confidence</span>
                      </div>
                    </div>
                  </div>

                  {/* Detailed score breakdown */}
                  <div className="mt-3 space-y-1.5 rounded-lg bg-gray-50 p-3 dark:bg-gray-800/50">
                    <ScoreBar label="Image" value={match.scores.imageScore ?? 0} icon={<Image size={12} />} />
                    <ScoreBar label="Brand" value={match.scores.brandScore ?? 0} icon={<Tag size={12} />} />
                    <ScoreBar label="Category" value={match.scores.categoryScore ?? 0} icon={<FolderOpen size={12} />} />
                    <ScoreBar label="Color" value={match.scores.colorScore ?? 0} icon={<Palette size={12} />} />
                    <ScoreBar label="Location" value={match.scores.locationScore ?? 0} icon={<MapPin size={12} />} />
                    <ScoreBar label="Date" value={match.scores.dateScore ?? 0} icon={<Calendar size={12} />} />
                  </div>

                  {/* AI Explanation */}
                  {match.scores.explanation && match.scores.explanation.length > 0 && (
                    <p className="mt-2 text-xs italic text-[var(--color-text-secondary)]">
                      {match.scores.explanation.join(' ')}
                    </p>
                  )}

                  <Link
                    to={`/claims/new?lostItemId=${id}&foundItemId=${match.foundItem._id}&score=${Math.round(match.scores.overallScore)}`}
                    className="btn-primary mt-3 text-xs"
                  >
                    Claim This Item
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
