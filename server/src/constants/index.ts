export const ROLES = {
  SUPER_ADMIN: 'SUPER_ADMIN',
  COLLEGE_ADMIN: 'COLLEGE_ADMIN',
  STUDENT: 'STUDENT',
} as const;

export type UserRole = (typeof ROLES)[keyof typeof ROLES];

export const USER_STATUS = {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
  SUSPENDED: 'SUSPENDED',
} as const;

export const COLLEGE_STATUS = {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
  PENDING: 'PENDING',
} as const;

export const ITEM_STATUS = {
  LOST: {
    OPEN: 'OPEN',
    CLAIMED: 'CLAIMED',
    RETURNED: 'RETURNED',
    CLOSED: 'CLOSED',
  },
  FOUND: {
    OPEN: 'OPEN',
    CLAIMED: 'CLAIMED',
    RETURNED: 'RETURNED',
    CLOSED: 'CLOSED',
  },
} as const;

export const CLAIM_STATUS = {
  PENDING: 'PENDING',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
  UNDER_REVIEW: 'UNDER_REVIEW',
} as const;

export const NOTIFICATION_TYPE = {
  CLAIM_UPDATE: 'CLAIM_UPDATE',
  ITEM_MATCH: 'ITEM_MATCH',
  SYSTEM: 'SYSTEM',
  ACCOUNT: 'ACCOUNT',
} as const;

export const COOKIE_NAMES = {
  ACCESS_TOKEN: 'accessToken',
  REFRESH_TOKEN: 'refreshToken',
} as const;

export const PAGINATION = {
  DEFAULT_PAGE: 1,
  DEFAULT_LIMIT: 10,
  MAX_LIMIT: 100,
} as const;

export const UPLOAD_FOLDER = {
  PROFILE_IMAGES: 'campus-lost-found/profiles',
  ITEM_IMAGES: 'campus-lost-found/items',
  COLLEGE_LOGOS: 'campus-lost-found/colleges',
} as const;

export const MATCH_WEIGHTS = {
  IMAGE_SIMILARITY: 0.4,
  BRAND_MATCH: 0.15,
  COLOR_MATCH: 0.15,
  CATEGORY_MATCH: 0.15,
  LOCATION_MATCH: 0.05,
  DATE_PROXIMITY: 0.1,
} as const;

export const MATCH_CONFIG = {
  DEFAULT_TOP_K: 10,
  MAX_TOP_K: 50,
  SIMILARITY_THRESHOLD: 0.3,
  DATE_PROXIMITY_DAYS: 30,
} as const;

export const ITEM_CATEGORIES = [
  'ELECTRONICS',
  'CLOTHING',
  'ACCESSORIES',
  'BOOKS',
  'BAGS',
  'KEYS',
  'ID_CARDS',
  'JEWELRY',
  'SPORTS',
  'OTHER',
] as const;
