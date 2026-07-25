import { z } from 'zod';

export const createUserSchema = z.object({
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name cannot exceed 100 characters'),
  email: z.string().email('Please provide a valid email'),
  password: z
    .string()
    .min(6, 'Password must be at least 6 characters')
    .max(128, 'Password cannot exceed 128 characters'),
  role: z.enum(['STUDENT', 'COLLEGE_ADMIN', 'SUPER_ADMIN']).optional(),
  college: z.string().min(1, 'College is required'),
  department: z.string().max(100).optional(),
  year: z.number().min(1).max(6).optional(),
  rollNumber: z.string().max(50).optional(),
  phone: z.string().max(20).optional(),
});

export const updateUserSchema = z.object({
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name cannot exceed 100 characters')
    .optional(),
  phone: z.string().max(20).optional(),
  department: z.string().max(100).optional(),
  year: z.number().min(1).max(6).optional(),
  rollNumber: z.string().max(50).optional(),
  profileImage: z.string().optional(),
  role: z.enum(['STUDENT', 'COLLEGE_ADMIN', 'SUPER_ADMIN']).optional(),
  isActive: z.boolean().optional(),
  trustScore: z.number().min(0).max(100).optional(),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
