import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, CheckCircle, XCircle } from 'lucide-react';
import { claimsApi } from '@/lib/services';
import { Skeleton } from '@/components/ui/Loading';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { timeAgo } from '@/lib/utils';
import toast from 'react-hot-toast';

export default function AdminClaimReviewPage() {
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  const [remarks, setRemarks] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['claim', id],
    queryFn: () => claimsApi.getById(id!),
    enabled: !!id,
  });

  const reviewMutation = useMutation({
    mutationFn: (status: 'APPROVED' | 'REJECTED') =>
      claimsApi.review(id!, { status, adminRemarks: remarks }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['claim', id] });
      queryClient.invalidateQueries({ queryKey: ['claims'] });
      toast.success('Claim reviewed');
    },
    onError: () => toast.error('Failed to review claim'),
  });

  const claim = data?.data?.data;

  if (isLoading) {
    return <div className="space-y-4"><Skeleton className="h-8 w-64" /><Skeleton className="h-48 w-full" /></div>;
  }

  if (!claim) {
    return <div className="py-12 text-center text-[var(--color-text-secondary)]">Claim not found.</div>;
  }

  const isPending = claim.status === 'PENDING' || claim.status === 'UNDER_REVIEW';

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Link to="/admin/claims" className="inline-flex items-center gap-1 text-sm text-[var(--color-text-secondary)] hover:text-primary-600">
        <ArrowLeft size={14} /> Back to Claims
      </Link>

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Review Claim</h1>
        <StatusBadge status={claim.status} />
      </div>

      {/* Student Info */}
      <div className="card">
        <h3 className="mb-2 font-semibold">Student</h3>
        {typeof claim.student === 'object' ? (
          <div className="flex items-center justify-between text-sm">
            <div>
              <p className="font-medium">{claim.student.name}</p>
              <p className="text-[var(--color-text-secondary)]">{claim.student.email}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-[var(--color-text-secondary)]">Trust Score</p>
              <p className={`text-lg font-bold ${claim.student.trustScore >= 60 ? 'text-green-600' : claim.student.trustScore >= 30 ? 'text-yellow-600' : 'text-red-600'}`}>
                {claim.student.trustScore}
              </p>
            </div>
          </div>
        ) : <p className="text-sm text-[var(--color-text-secondary)]">Unknown student</p>}
      </div>

      {/* Items */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="card">
          <p className="text-xs font-medium uppercase text-[var(--color-text-secondary)]">Lost Item</p>
          <p className="mt-1 font-semibold">{typeof claim.lostItem === 'object' ? claim.lostItem.title : '—'}</p>
        </div>
        <div className="card">
          <p className="text-xs font-medium uppercase text-[var(--color-text-secondary)]">Found Item</p>
          <p className="mt-1 font-semibold">{typeof claim.foundItem === 'object' ? claim.foundItem.title : '—'}</p>
        </div>
      </div>

      {/* AI Score */}
      {claim.aiMatchScore > 0 && (
        <div className="card flex items-center justify-between">
          <span className="text-sm text-[var(--color-text-secondary)]">AI Match Score</span>
          <span className="text-xl font-bold text-primary-600">{claim.aiMatchScore}%</span>
        </div>
      )}

      {/* Verification Answers */}
      <div className="card space-y-4">
        <h3 className="font-semibold">Verification Answers</h3>
        {claim.verificationAnswers?.map((va, i) => (
          <div key={i} className="rounded-lg bg-gray-50 p-3 dark:bg-gray-800/50">
            <p className="text-sm font-medium text-[var(--color-text-secondary)]">{va.question}</p>
            <p className="mt-1 text-sm">{va.answer}</p>
          </div>
        ))}
      </div>

      {/* Review Actions */}
      {isPending ? (
        <div className="card space-y-4">
          <h3 className="font-semibold">Admin Decision</h3>
          <div>
            <label className="mb-1 block text-sm font-medium">Remarks</label>
            <textarea
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              rows={3}
              className="input-field resize-none"
              placeholder="Add remarks for the student..."
            />
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => reviewMutation.mutate('APPROVED')}
              disabled={reviewMutation.isPending}
              className="btn-primary flex-1"
            >
              <CheckCircle size={16} /> Approve
            </button>
            <button
              onClick={() => reviewMutation.mutate('REJECTED')}
              disabled={reviewMutation.isPending}
              className="btn-danger flex-1"
            >
              <XCircle size={16} /> Reject
            </button>
          </div>
        </div>
      ) : (
        <div className="card">
          <p className="text-sm text-[var(--color-text-secondary)]">
            This claim was {claim.status.toLowerCase()} {claim.reviewedAt ? timeAgo(claim.reviewedAt) : ''}.
          </p>
          {claim.adminRemarks && <p className="mt-2 text-sm">Remarks: {claim.adminRemarks}</p>}
        </div>
      )}
    </div>
  );
}
