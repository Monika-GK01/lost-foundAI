import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ArrowLeft,
  CheckCircle,
  XCircle,
  AlertCircle,
  Mail,
  PackageCheck,
  Image as ImageIcon,
  Sparkles,
  Info,
} from 'lucide-react';
import { claimsApi, lostItemsApi } from '@/lib/services';
import { Skeleton } from '@/components/ui/Loading';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { MatchExplanation } from '@/components/ui/MatchExplanation';
import { timeAgo, formatDate, cn } from '@/lib/utils';
import type { MatchResult } from '@/types';
import toast from 'react-hot-toast';

function ItemPanel({
  label,
  item,
  dateLabel,
  dateValue,
}: {
  label: string;
  item: { title: string; description?: string; category: string; brand: string; color: string; images?: string[]; location?: string } | null;
  dateLabel: string;
  dateValue?: string;
}) {
  return (
    <div className="card overflow-hidden p-0">
      <div className="h-48 w-full bg-gray-100 dark:bg-gray-800">
        {item?.images?.[0] ? (
          <img src={item.images[0]} alt={item.title} className="h-full w-full object-cover" />
        ) : (
          <div className="flex h-full flex-col items-center justify-center gap-1 text-[var(--color-text-secondary)]">
            <ImageIcon size={28} />
            <span className="text-xs">No image</span>
          </div>
        )}
      </div>
      <div className="space-y-2 p-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-primary-600">{label}</p>
        <h3 className="font-semibold">{item?.title ?? '—'}</h3>
        {item?.description && (
          <p className="line-clamp-3 text-sm text-[var(--color-text-secondary)]">{item.description}</p>
        )}
        <dl className="grid grid-cols-2 gap-x-3 gap-y-1 pt-1 text-xs">
          <div>
            <dt className="text-[var(--color-text-secondary)]">Category</dt>
            <dd className="font-medium">{item?.category ?? '—'}</dd>
          </div>
          <div>
            <dt className="text-[var(--color-text-secondary)]">Brand</dt>
            <dd className="font-medium">{item?.brand ?? '—'}</dd>
          </div>
          <div>
            <dt className="text-[var(--color-text-secondary)]">Color</dt>
            <dd className="font-medium">{item?.color ?? '—'}</dd>
          </div>
          <div>
            <dt className="text-[var(--color-text-secondary)]">Location</dt>
            <dd className="font-medium">{item?.location ?? '—'}</dd>
          </div>
          {dateValue && (
            <div>
              <dt className="text-[var(--color-text-secondary)]">{dateLabel}</dt>
              <dd className="font-medium">{formatDate(dateValue)}</dd>
            </div>
          )}
        </dl>
      </div>
    </div>
  );
}

export default function AdminClaimReviewPage() {
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  const [remarks, setRemarks] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['claim', id],
    queryFn: () => claimsApi.getById(id!),
    enabled: !!id,
  });

  const claim = data?.data?.data;
  const lostItem = claim && typeof claim.lostItem === 'object' ? claim.lostItem : null;
  const foundItem = claim && typeof claim.foundItem === 'object' ? claim.foundItem : null;
  const student = claim && typeof claim.student === 'object' ? claim.student : null;

  // Re-compute the full match breakdown for this lost/found pair via the match engine.
  const { data: matchesData } = useQuery({
    queryKey: ['lost-item-matches', lostItem?._id],
    queryFn: () => lostItemsApi.getMatches(lostItem!._id),
    enabled: !!lostItem?._id,
  });

  const matchBreakdown: MatchResult | undefined = matchesData?.data?.data?.matches?.find(
    (m) => m.foundItem._id === foundItem?._id
  );

  const invalidate = () => {
    queryClient.invalidateQueries({ queryKey: ['claim', id] });
    queryClient.invalidateQueries({ queryKey: ['admin-claims'] });
    queryClient.invalidateQueries({ queryKey: ['claims'] });
  };

  const reviewMutation = useMutation({
    mutationFn: (status: 'APPROVED' | 'REJECTED' | 'NEEDS_REVIEW') =>
      claimsApi.review(id!, { status, adminRemarks: remarks }),
    onSuccess: (_d, status) => {
      invalidate();
      toast.success(
        status === 'APPROVED'
          ? 'Claim approved'
          : status === 'REJECTED'
            ? 'Claim rejected'
            : 'Flagged for manual review'
      );
    },
    onError: () => toast.error('Failed to review claim'),
  });

  const recoverMutation = useMutation({
    mutationFn: () => claimsApi.recover(id!),
    onSuccess: () => {
      invalidate();
      toast.success('Item marked as recovered');
    },
    onError: () => toast.error('Failed to mark as recovered'),
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  if (!claim) {
    return <div className="py-12 text-center text-[var(--color-text-secondary)]">Claim not found.</div>;
  }

  const canReview = claim.status === 'PENDING' || claim.status === 'UNDER_REVIEW' || claim.status === 'NEEDS_REVIEW';
  const canRecover = claim.status === 'APPROVED' && !claim.recoveryTimestamp;
  const scores = matchBreakdown?.scores;

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      <Link
        to="/admin/claims"
        className="inline-flex items-center gap-1 text-sm text-[var(--color-text-secondary)] hover:text-primary-600"
      >
        <ArrowLeft size={14} /> Back to Claims
      </Link>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">AI Match Review</h1>
          <p className="text-sm text-[var(--color-text-secondary)]">Claim #{claim._id.slice(-6).toUpperCase()}</p>
        </div>
        <StatusBadge status={claim.status} />
      </div>

      {/* Student */}
      <div className="card flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wide text-[var(--color-text-secondary)]">Claimed by</p>
          <p className="font-medium">{student?.name ?? 'Unknown student'}</p>
          {student?.email && (
            <a
              href={`mailto:${student.email}`}
              className="inline-flex items-center gap-1 text-sm text-primary-600 hover:underline"
            >
              <Mail size={13} /> {student.email}
            </a>
          )}
        </div>
        {student && (
          <div className="text-right">
            <p className="flex items-center justify-end gap-1 text-xs text-[var(--color-text-secondary)]">
              Trust Score
              <span className="group relative">
                <Info size={12} />
                <span className="pointer-events-none absolute right-0 top-5 z-10 hidden w-56 rounded-lg bg-gray-900 p-2 text-left text-[11px] font-normal text-white group-hover:block">
                  Trust score reflects a student's claim history — verified recoveries raise it, rejected claims lower it.
                </span>
              </span>
            </p>
            <p
              className={cn(
                'text-lg font-bold',
                student.trustScore >= 60
                  ? 'text-green-600'
                  : student.trustScore >= 30
                    ? 'text-yellow-600'
                    : 'text-red-600'
              )}
            >
              {student.trustScore}
            </p>
          </div>
        )}
      </div>

      {/* Side-by-side items */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <ItemPanel label="Reported Lost" item={lostItem} dateLabel="Date Lost" dateValue={lostItem?.dateLost} />
        <ItemPanel label="Reported Found" item={foundItem} dateLabel="Date Found" dateValue={foundItem?.dateFound} />
      </div>

      {/* AI confidence breakdown */}
      <div className="card space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="flex items-center gap-2 font-semibold">
            <Sparkles size={16} className="text-primary-600" /> AI Confidence Breakdown
          </h3>
          <span
            className={cn(
              'rounded-lg px-3 py-1 text-sm font-bold',
              claim.aiMatchScore >= 70
                ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                : claim.aiMatchScore >= 40
                  ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300'
                  : 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300'
            )}
          >
            {claim.aiMatchScore}% overall
          </span>
        </div>

        {scores ? (
          <MatchExplanation scores={scores} />
        ) : (
          <p className="text-sm text-[var(--color-text-secondary)]">
            Detailed dimension scores are unavailable for this pair; using the stored overall score.
          </p>
        )}
      </div>

      {/* Verification answers */}
      {claim.verificationAnswers?.length > 0 && (
        <div className="card space-y-3">
          <h3 className="font-semibold">Verification Answers</h3>
          {claim.verificationAnswers.map((va, i) => (
            <div key={i} className="rounded-lg bg-gray-50 p-3 dark:bg-gray-800/50">
              <p className="text-sm font-medium text-[var(--color-text-secondary)]">{va.question}</p>
              <p className="mt-1 text-sm">{va.answer}</p>
            </div>
          ))}
        </div>
      )}

      {/* Proof images */}
      {claim.proofImages?.length > 0 && (
        <div className="card space-y-3">
          <h3 className="font-semibold">Proof Images</h3>
          <div className="flex flex-wrap gap-3">
            {claim.proofImages.map((img, i) => (
              <img
                key={i}
                src={img}
                alt={`Proof ${i + 1}`}
                className="h-24 w-24 rounded-lg object-cover"
              />
            ))}
          </div>
        </div>
      )}

      {/* Decision */}
      {canReview ? (
        <div className="card space-y-4">
          <h3 className="font-semibold">Admin Decision</h3>
          <div>
            <label htmlFor="remarks" className="mb-1 block text-sm font-medium">
              Remarks
            </label>
            <textarea
              id="remarks"
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              rows={3}
              className="input-field resize-none"
              placeholder="Add remarks for the student..."
            />
          </div>
          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              onClick={() => reviewMutation.mutate('APPROVED')}
              disabled={reviewMutation.isPending}
              className="btn-primary inline-flex flex-1 items-center justify-center gap-1"
            >
              <CheckCircle size={16} /> Approve
            </button>
            <button
              onClick={() => reviewMutation.mutate('NEEDS_REVIEW')}
              disabled={reviewMutation.isPending}
              className="inline-flex flex-1 items-center justify-center gap-1 rounded-lg border border-orange-300 px-4 py-2 text-sm font-medium text-orange-600 transition-colors hover:bg-orange-50 dark:border-orange-900/40 dark:hover:bg-orange-900/20"
            >
              <AlertCircle size={16} /> Needs Manual Review
            </button>
            <button
              onClick={() => reviewMutation.mutate('REJECTED')}
              disabled={reviewMutation.isPending}
              className="btn-danger inline-flex flex-1 items-center justify-center gap-1"
            >
              <XCircle size={16} /> Reject
            </button>
          </div>
        </div>
      ) : (
        <div className="card space-y-3">
          <p className="text-sm text-[var(--color-text-secondary)]">
            This claim was {claim.status.replace(/_/g, ' ').toLowerCase()}{' '}
            {claim.reviewedAt ? timeAgo(claim.reviewedAt) : ''}.
          </p>
          {claim.adminRemarks && <p className="text-sm">Remarks: {claim.adminRemarks}</p>}

          {canRecover && (
            <button
              onClick={() => recoverMutation.mutate()}
              disabled={recoverMutation.isPending}
              className="btn-primary inline-flex items-center gap-1"
            >
              <PackageCheck size={16} /> Mark as Recovered
            </button>
          )}

          {claim.recoveryTimestamp && (
            <p className="inline-flex items-center gap-1 text-sm font-medium text-green-600">
              <PackageCheck size={15} /> Recovered {timeAgo(claim.recoveryTimestamp)}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
