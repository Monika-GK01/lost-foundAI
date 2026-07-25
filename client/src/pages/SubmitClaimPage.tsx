import { useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { claimsApi } from '@/lib/services';
import toast from 'react-hot-toast';

const VERIFICATION_QUESTIONS = [
  'Describe any unique markings, scratches, or identifiers on the item.',
  'What was the exact contents or items stored inside (if applicable)?',
  'When and where did you last use or see the item?',
];

export default function SubmitClaimPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const lostItemId = searchParams.get('lostItemId') ?? '';
  const foundItemId = searchParams.get('foundItemId') ?? '';
  const aiScore = searchParams.get('score') ?? '0';

  const [answers, setAnswers] = useState<string[]>(VERIFICATION_QUESTIONS.map(() => ''));

  const mutation = useMutation({
    mutationFn: () =>
      claimsApi.create({
        lostItemId,
        foundItemId,
        verificationAnswers: VERIFICATION_QUESTIONS.map((q, i) => ({ question: q, answer: answers[i] })),
        aiMatchScore: Number(aiScore),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['claims'] });
      toast.success('Claim submitted successfully!');
      navigate('/claims');
    },
    onError: () => toast.error('Failed to submit claim'),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (answers.some((a) => !a.trim())) {
      toast.error('Please answer all verification questions');
      return;
    }
    mutation.mutate();
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="text-2xl font-bold">Submit Claim</h1>

      {aiScore && Number(aiScore) > 0 && (
        <div className="rounded-xl border border-primary-200 bg-primary-50 p-4 dark:border-primary-800 dark:bg-primary-900/20">
          <p className="text-sm font-medium text-primary-700 dark:text-primary-300">
            AI Match Score: {aiScore}% — This item was matched using our AI engine.
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit} className="card space-y-5">
        <p className="text-sm text-[var(--color-text-secondary)]">
          To verify your ownership, please answer the following questions in detail.
        </p>

        {VERIFICATION_QUESTIONS.map((question, i) => (
          <div key={i}>
            <label className="mb-1 block text-sm font-medium">{question}</label>
            <textarea
              value={answers[i]}
              onChange={(e) => setAnswers((prev) => prev.map((a, idx) => (idx === i ? e.target.value : a)))}
              rows={3}
              className="input-field resize-none"
              placeholder="Your answer..."
            />
          </div>
        ))}

        <div className="flex gap-3">
          <button type="submit" disabled={mutation.isPending} className="btn-primary flex-1">
            {mutation.isPending ? 'Submitting...' : 'Submit Claim'}
          </button>
          <button type="button" onClick={() => navigate(-1)} className="btn-secondary">Cancel</button>
        </div>
      </form>
    </div>
  );
}
