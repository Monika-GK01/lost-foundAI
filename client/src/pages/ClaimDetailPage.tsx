import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Clock, CheckCircle, XCircle, AlertCircle, MapPin, KeyRound } from 'lucide-react';
import { claimsApi } from '@/lib/services';
import { Skeleton } from '@/components/ui/Loading';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { formatDate, timeAgo } from '@/lib/utils';
import toast from 'react-hot-toast';

export default function ClaimDetailPage() {
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['claim', id],
    queryFn: () => claimsApi.getById(id!),
    enabled: !!id,
  });

  const cancelMutation = useMutation({
    mutationFn: () => claimsApi.cancel(id!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['claim', id] });
      toast.success('Claim cancelled');
    },
    onError: () => toast.error('Failed to cancel claim'),
  });

  const claim = data?.data?.data;

  if (isLoading) {
    return <div className="space-y-4"><Skeleton className="h-8 w-64" /><Skeleton className="h-48 w-full" /></div>;
  }

  if (!claim) {
    return <div className="py-12 text-center text-[var(--color-text-secondary)]">Claim not found.</div>;
  }

  const timeline = [
    { label: 'Claim Submitted', date: claim.createdAt, icon: Clock, done: true },
    { label: 'Under Review', date: claim.status !== 'PENDING' ? claim.updatedAt : null, icon: AlertCircle, done: claim.status !== 'PENDING' },
    { label: claim.status === 'REJECTED' ? 'Rejected' : 'Approved', date: claim.reviewedAt, icon: claim.status === 'REJECTED' ? XCircle : CheckCircle, done: claim.status === 'APPROVED' || claim.status === 'REJECTED' },
  ];

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <Link to="/claims" className="inline-flex items-center gap-1 text-sm text-[var(--color-text-secondary)] hover:text-primary-600">
        <ArrowLeft size={14} /> Back to Claims
      </Link>

      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Claim Details</h1>
        <StatusBadge status={claim.status} />
      </div>

      {/* Items */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="card">
          <p className="text-xs font-medium uppercase text-[var(--color-text-secondary)]">Lost Item</p>
          <p className="mt-1 font-semibold">{typeof claim.lostItem === 'object' ? claim.lostItem.title : '—'}</p>
          {typeof claim.lostItem === 'object' && (
            <p className="text-sm text-[var(--color-text-secondary)]">{claim.lostItem.category} • {claim.lostItem.brand || 'N/A'}</p>
          )}
        </div>
        <div className="card">
          <p className="text-xs font-medium uppercase text-[var(--color-text-secondary)]">Found Item</p>
          <p className="mt-1 font-semibold">{typeof claim.foundItem === 'object' ? claim.foundItem.title : '—'}</p>
          {typeof claim.foundItem === 'object' && (
            <p className="text-sm text-[var(--color-text-secondary)]">{claim.foundItem.category} • {claim.foundItem.brand || 'N/A'}</p>
          )}
        </div>
      </div>

      {/* AI Score */}
      {claim.aiMatchScore > 0 && (
        <div className="card">
          <p className="text-sm text-[var(--color-text-secondary)]">AI Match Score</p>
          <p className="text-2xl font-bold text-primary-600">{claim.aiMatchScore}%</p>
        </div>
      )}

      {/* Verification Answers */}
      <div className="card space-y-4">
        <h3 className="font-semibold">Verification Answers</h3>
        {claim.verificationAnswers?.map((va, i) => (
          <div key={i}>
            <p className="text-sm font-medium text-[var(--color-text-secondary)]">{va.question}</p>
            <p className="mt-1 text-sm">{va.answer}</p>
          </div>
        ))}
      </div>

      {/* Timeline */}
      <div className="card">
        <h3 className="mb-4 font-semibold">Timeline</h3>
        <div className="space-y-4">
          {timeline.map((step, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className={`flex h-8 w-8 items-center justify-center rounded-full ${step.done ? 'bg-primary-100 text-primary-600 dark:bg-primary-900/40' : 'bg-gray-100 text-gray-400 dark:bg-gray-800'}`}>
                <step.icon size={16} />
              </div>
              <div>
                <p className={`text-sm font-medium ${step.done ? '' : 'text-[var(--color-text-secondary)]'}`}>{step.label}</p>
                {step.date && <p className="text-xs text-[var(--color-text-secondary)]">{formatDate(step.date)}</p>}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Pickup Information */}
      {claim.status === 'APPROVED' && claim.pickupDetails && (
        <div className="card border-l-4 border-l-green-500">
          <h3 className="mb-3 flex items-center gap-2 font-semibold text-green-700 dark:text-green-400">
            <MapPin size={16} /> Pickup Information
          </h3>
          <dl className="grid grid-cols-1 gap-x-6 gap-y-2 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-[var(--color-text-secondary)]">Office</dt>
              <dd className="font-medium">{claim.pickupDetails.office}</dd>
            </div>
            <div>
              <dt className="text-[var(--color-text-secondary)]">Building / Room</dt>
              <dd className="font-medium">{claim.pickupDetails.building}, Room {claim.pickupDetails.room}</dd>
            </div>
            <div>
              <dt className="text-[var(--color-text-secondary)]">Contact Person</dt>
              <dd className="font-medium">{claim.pickupDetails.contactPerson}</dd>
            </div>
            <div>
              <dt className="text-[var(--color-text-secondary)]">Pickup Time</dt>
              <dd className="font-medium">{claim.pickupDetails.pickupTime}</dd>
            </div>
          </dl>
          <div className="mt-4 flex items-center gap-2 rounded-lg bg-green-50 px-3 py-2 dark:bg-green-900/20">
            <KeyRound size={16} className="text-green-600" />
            <span className="text-sm text-green-700 dark:text-green-300">Verification Code:</span>
            <span className="rounded bg-green-600 px-2 py-0.5 font-mono text-sm font-bold text-white">{claim.pickupDetails.verificationCode}</span>
          </div>
        </div>
      )}

      {/* Admin Remarks */}
      {claim.adminRemarks && (
        <div className="card">
          <h3 className="mb-2 font-semibold">Admin Remarks</h3>
          <p className="text-sm text-[var(--color-text-secondary)]">{claim.adminRemarks}</p>
          {claim.reviewedBy && typeof claim.reviewedBy === 'object' && (
            <p className="mt-2 text-xs text-[var(--color-text-secondary)]">Reviewed by {claim.reviewedBy.name} • {claim.reviewedAt ? timeAgo(claim.reviewedAt) : ''}</p>
          )}
        </div>
      )}

      {/* Cancel Button */}
      {(claim.status === 'PENDING' || claim.status === 'UNDER_REVIEW') && (
        <button onClick={() => cancelMutation.mutate()} disabled={cancelMutation.isPending} className="btn-danger">
          {cancelMutation.isPending ? 'Cancelling...' : 'Cancel Claim'}
        </button>
      )}
    </div>
  );
}
