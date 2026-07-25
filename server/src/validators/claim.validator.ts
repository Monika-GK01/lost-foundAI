import { z } from 'zod';

const verificationAnswerSchema = z.object({
  question: z.string().min(1, 'Question is required').max(500),
  answer: z.string().min(1, 'Answer is required').max(2000),
});

export const createClaimSchema = z.object({
  lostItemId: z.string().min(1, 'Lost item ID is required'),
  foundItemId: z.string().min(1, 'Found item ID is required'),
  verificationAnswers: z
    .array(verificationAnswerSchema)
    .min(1, 'At least one verification answer is required')
    .max(20, 'Cannot exceed 20 verification answers'),
  proofImages: z.array(z.string().url('Invalid image URL')).max(5, 'Maximum 5 proof images').optional(),
  aiMatchScore: z.number().min(0).max(1).optional(),
});

export const reviewClaimSchema = z.object({
  status: z.enum(['APPROVED', 'REJECTED'], {
    errorMap: () => ({ message: 'Status must be APPROVED or REJECTED' }),
  }),
  adminRemarks: z.string().max(2000, 'Remarks cannot exceed 2000 characters').optional(),
});

export type CreateClaimInput = z.infer<typeof createClaimSchema>;
export type ReviewClaimInput = z.infer<typeof reviewClaimSchema>;
