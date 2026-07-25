import { z } from 'zod';
import { ITEM_CATEGORIES } from '../constants';

export const createLostItemSchema = z.object({
  title: z
    .string()
    .min(3, 'Title must be at least 3 characters')
    .max(200, 'Title cannot exceed 200 characters'),
  description: z
    .string()
    .min(10, 'Description must be at least 10 characters')
    .max(2000, 'Description cannot exceed 2000 characters'),
  category: z.enum(ITEM_CATEGORIES, {
    errorMap: () => ({ message: 'Invalid category' }),
  }),
  brand: z.string().max(100).optional(),
  color: z.string().max(50).optional(),
  location: z.string().max(200).optional(),
  dateLost: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: 'Invalid date format',
  }),
  reward: z.string().max(200).optional(),
});

export const updateLostItemSchema = z.object({
  title: z
    .string()
    .min(3, 'Title must be at least 3 characters')
    .max(200, 'Title cannot exceed 200 characters')
    .optional(),
  description: z
    .string()
    .min(10, 'Description must be at least 10 characters')
    .max(2000, 'Description cannot exceed 2000 characters')
    .optional(),
  category: z.enum(ITEM_CATEGORIES).optional(),
  brand: z.string().max(100).optional(),
  color: z.string().max(50).optional(),
  location: z.string().max(200).optional(),
  dateLost: z
    .string()
    .refine((val) => !isNaN(Date.parse(val)), {
      message: 'Invalid date format',
    })
    .optional(),
  reward: z.string().max(200).optional(),
  status: z.enum(['OPEN', 'CLAIMED', 'RETURNED', 'CLOSED']).optional(),
});

export type CreateLostItemInput = z.infer<typeof createLostItemSchema>;
export type UpdateLostItemInput = z.infer<typeof updateLostItemSchema>;
