import { z } from 'zod';

export const registerSchema = z.object({
  name: z
    .string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name cannot exceed 100 characters'),
  email: z.string().email('Please provide a valid email'),
  password: z
    .string()
    .min(6, 'Password must be at least 6 characters')
    .max(128, 'Password cannot exceed 128 characters'),
  college: z.string().min(1, 'College is required'),
  role: z.enum(['STUDENT', 'COLLEGE_ADMIN']).optional(),
  department: z.string().max(100).optional(),
  year: z.number().min(1).max(6).optional(),
  rollNumber: z.string().max(50).optional(),
  phone: z.string().max(20).optional(),
});

export const loginSchema = z.object({
  email: z.string().email('Please provide a valid email'),
  password: z.string().min(1, 'Password is required'),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
