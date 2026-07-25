import { CheckCircle, Circle, Clock } from 'lucide-react';

export interface TimelineStage {
  label: string;
  description?: string;
  date?: string;
  completed: boolean;
  current?: boolean;
}

interface RecoveryTimelineProps {
  stages: TimelineStage[];
}

export function RecoveryTimeline({ stages }: RecoveryTimelineProps) {
  return (
    <div className="space-y-0" role="list" aria-label="Recovery timeline">
      {stages.map((stage, index) => (
        <div key={index} className="relative flex gap-3 pb-6 last:pb-0" role="listitem">
          {/* Connector line */}
          {index < stages.length - 1 && (
            <div
              className={`absolute left-[11px] top-6 h-full w-0.5 ${
                stage.completed ? 'bg-green-500' : 'bg-gray-200 dark:bg-gray-700'
              }`}
              aria-hidden="true"
            />
          )}

          {/* Icon */}
          <div className="relative z-10 mt-0.5">
            {stage.completed ? (
              <CheckCircle size={22} className="text-green-500" aria-hidden="true" />
            ) : stage.current ? (
              <Clock size={22} className="text-primary-500 animate-pulse" aria-hidden="true" />
            ) : (
              <Circle size={22} className="text-gray-300 dark:text-gray-600" aria-hidden="true" />
            )}
          </div>

          {/* Content */}
          <div className="flex-1">
            <p
              className={`text-sm font-medium ${
                stage.completed
                  ? 'text-green-700 dark:text-green-300'
                  : stage.current
                  ? 'text-primary-600 dark:text-primary-400'
                  : 'text-gray-400 dark:text-gray-500'
              }`}
            >
              {stage.label}
            </p>
            {stage.description && (
              <p className="text-xs text-[var(--color-text-secondary)]">{stage.description}</p>
            )}
            {stage.date && (
              <p className="text-xs text-[var(--color-text-secondary)]">{stage.date}</p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

/**
 * Derives recovery timeline stages from item and claim status.
 */
export function buildRecoveryStages(
  itemStatus: string,
  claimStatus?: string,
  dates?: { createdAt?: string; matchFound?: string; claimSubmitted?: string; reviewedAt?: string; recoveredAt?: string }
): TimelineStage[] {
  const stages: TimelineStage[] = [];

  // Stage 1: Reported
  stages.push({
    label: 'Reported',
    description: 'Item was reported',
    date: dates?.createdAt ? new Date(dates.createdAt).toLocaleDateString() : undefined,
    completed: true,
  });

  // Stage 2: AI Match Found
  const hasMatch = claimStatus !== undefined;
  stages.push({
    label: 'AI Match Found',
    description: 'Potential match identified',
    date: dates?.matchFound ? new Date(dates.matchFound).toLocaleDateString() : undefined,
    completed: hasMatch,
    current: !hasMatch && itemStatus === 'OPEN',
  });

  // Stage 3: Claim Submitted
  const claimSubmitted = claimStatus !== undefined && claimStatus !== '';
  stages.push({
    label: 'Claim Submitted',
    description: 'Ownership claim filed',
    date: dates?.claimSubmitted ? new Date(dates.claimSubmitted).toLocaleDateString() : undefined,
    completed: claimSubmitted,
    current: hasMatch && !claimSubmitted,
  });

  // Stage 4: Admin Reviewing
  const isReviewing = claimStatus === 'UNDER_REVIEW' || claimStatus === 'PENDING';
  const isReviewed = claimStatus === 'APPROVED' || claimStatus === 'REJECTED';
  stages.push({
    label: 'Admin Reviewing',
    description: 'Verification in progress',
    completed: isReviewed,
    current: isReviewing,
  });

  // Stage 5: Claim Approved
  const isApproved = claimStatus === 'APPROVED';
  stages.push({
    label: 'Claim Approved',
    description: 'Ownership verified',
    date: dates?.reviewedAt ? new Date(dates.reviewedAt).toLocaleDateString() : undefined,
    completed: isApproved,
    current: isReviewed && !isApproved,
  });

  // Stage 6: Recovered
  const isRecovered = itemStatus === 'RETURNED' || itemStatus === 'CLOSED';
  stages.push({
    label: 'Recovered',
    description: 'Item returned to owner',
    date: dates?.recoveredAt ? new Date(dates.recoveredAt).toLocaleDateString() : undefined,
    completed: isRecovered,
    current: isApproved && !isRecovered,
  });

  return stages;
}
