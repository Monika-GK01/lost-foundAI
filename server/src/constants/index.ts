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
  UNDER_REVIEW: 'UNDER_REVIEW',
  NEEDS_REVIEW: 'NEEDS_REVIEW',
  APPROVED: 'APPROVED',
  REJECTED: 'REJECTED',
  CANCELLED: 'CANCELLED',
} as const;

export const NOTIFICATION_TYPE = {
  CLAIM_SUBMITTED: 'CLAIM_SUBMITTED',
  CLAIM_APPROVED: 'CLAIM_APPROVED',
  CLAIM_REJECTED: 'CLAIM_REJECTED',
  CLAIM_UPDATE: 'CLAIM_UPDATE',
  ITEM_RECOVERED: 'ITEM_RECOVERED',
  ITEM_MATCH: 'ITEM_MATCH',
  ADMIN_REMARKS: 'ADMIN_REMARKS',
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
  IMAGE_SIMILARITY: 0.30,
  TITLE_MATCH: 0.20,
  BRAND_MATCH: 0.15,
  COLOR_MATCH: 0.10,
  CATEGORY_MATCH: 0.15,
  LOCATION_MATCH: 0.05,
  DATE_PROXIMITY: 0.05,
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

export const TRUST_SCORE = {
  APPROVED_CLAIM: 10,
  SUCCESSFUL_FOUND_SUBMISSION: 5,
  FALSE_CLAIM: -10,
  REJECTED_SPAM: -15,
  DUPLICATE_REPORT: -5,
  MIN: 0,
  MAX: 100,
  DEFAULT: 50,
} as const;

export const AUDIT_ACTIONS = {
  CLAIM_CREATED: 'CLAIM_CREATED',
  CLAIM_REVIEWED: 'CLAIM_REVIEWED',
  CLAIM_APPROVED: 'CLAIM_APPROVED',
  CLAIM_REJECTED: 'CLAIM_REJECTED',
  CLAIM_CANCELLED: 'CLAIM_CANCELLED',
  ITEM_RECOVERED: 'ITEM_RECOVERED',
  TRUST_SCORE_UPDATED: 'TRUST_SCORE_UPDATED',
  ITEM_CREATED: 'ITEM_CREATED',
  ITEM_UPDATED: 'ITEM_UPDATED',
  ITEM_DELETED: 'ITEM_DELETED',
} as const;

export const VERIFICATION_QUESTIONS = [
  'What is the exact brand of the item?',
  'What is the color of the item?',
  'Approximate purchase month/year?',
  'Does it have any special sticker?',
  'Does it have any scratch or damage?',
  'Any unique identifying mark?',
  'What contents were inside (if bag)?',
  'Last location you saw it?',
  'Approximate time it was lost?',
  'Any additional proof of ownership?',
] as const;
