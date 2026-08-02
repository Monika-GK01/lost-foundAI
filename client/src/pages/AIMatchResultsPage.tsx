import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Sparkles, Check, X, Columns2 } from 'lucide-react';
import { lostItemsApi } from '@/lib/services';
import { Skeleton } from '@/components/ui/Loading';
import { EmptyState } from '@/components/ui/EmptyState';
import { MatchExplanation } from '@/components/ui/MatchExplanation';
import type { MatchResult } from '@/types';
import toast from 'react-hot-toast';

export default function AIMatchResultsPage() {
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  const [ignoredIds, setIgnoredIds] = useState<Set<string>>(new Set());
  const [compareId, setCompareId] = useState<string | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['lost-item-matches', id],
    queryFn: () => lostItemsApi.getMatches(id!),
    enabled: !!id,
  });

  const { data: lostItemData } = useQuery({
    queryKey: ['lost-item', id],
    queryFn: () => lostItemsApi.getById(id!),
    enabled: !!id,
  });

  const lostItem = lostItemData?.data?.data;
  const matches = data?.data?.data?.matches ?? [];

  const actionMutation = useMutation({
    mutationFn: ({ foundItemId, action }: { foundItemId: string; action: 'accept' | 'ignore' }) =>
      lostItemsApi.matchAction(id!, { foundItemId, action }),
    onSuccess: (_d, vars) => {
      if (vars.action === 'ignore') {
        setIgnoredIds((prev) => new Set(prev).add(vars.foundItemId));
        toast.success('Match ignored');
      } else {
        toast.success('Match accepted! Proceed to claim.');
      }
      queryClient.invalidateQueries({ queryKey: ['lost-item-matches', id] });
    },
    onError: () => toast.error('Failed to update match'),
  });

  if (isLoading) {
    return <div className="space-y-4"><Skeleton className="h-8 w-64" /><Skeleton className="h-48 w-full" /><Skeleton className="h-48 w-full" /></div>;
  }

  const compareMatch = compareId ? matches.find((m) => m.foundItem._id === compareId) : null;

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

      {/* Compare panel */}
      {compareMatch && lostItem && (
        <div className="card border-2 border-primary-200 dark:border-primary-800">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="flex items-center gap-2 font-semibold"><Columns2 size={16} /> Side-by-Side Comparison</h3>
            <button onClick={() => setCompareId(null)} className="text-sm text-[var(--color-text-secondary)] hover:underline">Close</button>
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="mb-1 text-xs font-semibold uppercase text-primary-600">Your Lost Item</p>
              <p className="font-medium">{lostItem.title}</p>
              <p className="text-[var(--color-text-secondary)]">{lostItem.category} • {lostItem.brand || 'N/A'} • {lostItem.color || 'N/A'}</p>
              <p className="text-[var(--color-text-secondary)]">{lostItem.location}</p>
            </div>
            <div>
              <p className="mb-1 text-xs font-semibold uppercase text-green-600">Matched Found Item</p>
              <p className="font-medium">{compareMatch.foundItem.title}</p>
              <p className="text-[var(--color-text-secondary)]">{compareMatch.foundItem.category} • {compareMatch.foundItem.brand || 'N/A'} • {compareMatch.foundItem.color || 'N/A'}</p>
              <p className="text-[var(--color-text-secondary)]">{compareMatch.foundItem.location}</p>
            </div>
          </div>
        </div>
      )}

      {matches.length === 0 ? (
        <EmptyState title="No matches found" description="Our AI couldn't find any matching found items. Try again later as new items are reported." />
      ) : (
        <div className="space-y-4">
          {matches.map((match: MatchResult, index: number) => {
            const isIgnored = ignoredIds.has(match.foundItem._id);
            return (
              <div key={match.foundItem._id} className={`card transition-opacity ${isIgnored ? 'opacity-50' : ''}`}>
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
                          match.scores.overallScore >= 0.7 ? 'bg-green-100 dark:bg-green-900/30' :
                          match.scores.overallScore >= 0.4 ? 'bg-yellow-100 dark:bg-yellow-900/30' :
                          'bg-gray-100 dark:bg-gray-800'
                        }`}>
                          <span className={`text-lg font-bold ${
                            match.scores.overallScore >= 0.7 ? 'text-green-700 dark:text-green-300' :
                            match.scores.overallScore >= 0.4 ? 'text-yellow-700 dark:text-yellow-300' :
                            'text-gray-700 dark:text-gray-300'
                          }`}>
                            {Math.round(match.scores.overallScore * 100)}%
                          </span>
                          <span className="text-[10px] text-[var(--color-text-secondary)]">Confidence</span>
                        </div>
                      </div>
                    </div>

                    {/* Detailed score breakdown + explanation */}
                    <div className="mt-3">
                      <MatchExplanation scores={match.scores} />
                    </div>

                    {/* Action buttons */}
                    <div className="mt-3 flex flex-wrap items-center gap-2">
                      {isIgnored ? (
                        <span className="inline-flex items-center gap-1 rounded-lg bg-gray-100 px-3 py-1.5 text-xs font-medium text-gray-500 dark:bg-gray-800">
                          <X size={12} /> Ignored
                        </span>
                      ) : (
                        <>
                          <Link
                            to={`/claims/new?lostItemId=${id}&foundItemId=${match.foundItem._id}&score=${Math.round(match.scores.overallScore * 100)}`}
                            className="btn-primary inline-flex items-center gap-1 text-xs"
                          >
                            <Check size={13} /> Accept & Claim
                          </Link>
                          <button
                            onClick={() => actionMutation.mutate({ foundItemId: match.foundItem._id, action: 'ignore' })}
                            disabled={actionMutation.isPending}
                            className="inline-flex items-center gap-1 rounded-lg border border-[var(--color-border)] px-3 py-1.5 text-xs font-medium text-[var(--color-text-secondary)] transition-colors hover:bg-gray-50 dark:hover:bg-gray-800"
                          >
                            <X size={13} /> Ignore
                          </button>
                          <button
                            onClick={() => setCompareId(compareId === match.foundItem._id ? null : match.foundItem._id)}
                            className="inline-flex items-center gap-1 rounded-lg border border-[var(--color-border)] px-3 py-1.5 text-xs font-medium text-[var(--color-text-secondary)] transition-colors hover:bg-gray-50 dark:hover:bg-gray-800"
                          >
                            <Columns2 size={13} /> Compare
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
