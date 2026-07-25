import { z } from 'zod';

export const createCollegeSchema = z.object({
  name: z
    .string()
    .min(2, 'College name must be at least 2 characters')
    .max(200, 'College name cannot exceed 200 characters'),
  collegeCode: z
    .string()
    .min(2, 'College code must be at least 2 characters')
    .max(20, 'College code cannot exceed 20 characters'),
  email: z.string().email('Please provide a valid email'),
  phone: z.string().max(20).optional(),
  logo: z.string().url().optional().or(z.literal('')),
  address: z.string().max(500).optional(),
  website: z.string().url().optional().or(z.literal('')),
  status: z.enum(['ACTIVE', 'INACTIVE', 'PENDING']).optional(),
});

export const updateCollegeSchema = z.object({
  name: z
    .string()
    .min(2, 'College name must be at least 2 characters')
    .max(200, 'College name cannot exceed 200 characters')
    .optional(),
  email: z.string().email('Please provide a valid email').optional(),
  phone: z.string().max(20).optional(),
  logo: z.string().url().optional().or(z.literal('')),
  address: z.string().max(500).optional(),
  website: z.string().url().optional().or(z.literal('')),
  status: z.enum(['ACTIVE', 'INACTIVE', 'PENDING']).optional(),
});

export type CreateCollegeInput = z.infer<typeof createCollegeSchema>;
export type UpdateCollegeInput = z.infer<typeof updateCollegeSchema>;
