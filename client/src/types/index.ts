export interface User {
  _id: string;
  name: string;
  email: string;
  role: 'SUPER_ADMIN' | 'COLLEGE_ADMIN' | 'STUDENT';
  college: { _id: string; name: string; collegeCode: string } | string;
  profileImage: string;
  department: string;
  year: number;
  rollNumber: string;
  phone: string;
  trustScore: number;
  emailVerified: boolean;
  isActive: boolean;
  lastLogin: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface College {
  _id: string;
  name: string;
  collegeCode: string;
  email: string;
  phone: string;
  logo: string;
  address: string;
  website: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface LostItem {
  _id: string;
  title: string;
  description: string;
  category: string;
  brand: string;
  color: string;
  images: string[];
  owner: { _id: string; name: string; email: string; profileImage: string } | string;
  college: { _id: string; name: string; collegeCode: string } | string;
  location: string;
  dateLost: string;
  status: string;
  reward: string;
  thumbnailUrl: string;
  optimizedImageUrl: string;
  createdAt: string;
  updatedAt: string;
}

export interface FoundItem {
  _id: string;
  title: string;
  description: string;
  category: string;
  brand: string;
  color: string;
  images: string[];
  finder: { _id: string; name: string; email: string; profileImage: string } | string;
  college: { _id: string; name: string; collegeCode: string } | string;
  location: string;
  dateFound: string;
  status: string;
  thumbnailUrl: string;
  optimizedImageUrl: string;
  createdAt: string;
  updatedAt: string;
}

export interface VerificationAnswer {
  question: string;
  answer: string;
}

export interface Claim {
  _id: string;
  student: { _id: string; name: string; email: string; trustScore: number } | string;
  lostItem: { _id: string; title: string; category: string; brand: string; color: string } | string;
  foundItem: { _id: string; title: string; category: string; brand: string; color: string } | string;
  college: { _id: string; name: string; collegeCode: string } | string;
  verificationAnswers: VerificationAnswer[];
  proofImages: string[];
  status: 'PENDING' | 'UNDER_REVIEW' | 'APPROVED' | 'REJECTED' | 'CANCELLED';
  adminRemarks: string;
  reviewedBy: { _id: string; name: string; email: string } | null;
  reviewedAt: string | null;
  recoveryTimestamp: string | null;
  aiMatchScore: number;
  createdAt: string;
  updatedAt: string;
}

export interface Notification {
  _id: string;
  recipient: string;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  createdAt: string;
}

export interface MatchResult {
  foundItem: FoundItem;
  scores: {
    imageScore: number;
    brandScore: number;
    colorScore: number;
    categoryScore: number;
    locationScore: number;
    dateScore: number;
    overallScore: number;
    explanation: string[];
  };
}

export interface Analytics {
  pendingClaims: number;
  recoveredItems: number;
  totalLostItems: number;
  totalFoundItems: number;
  claimsToday: number;
  averageResolutionTimeHours: number;
  topCategories: { category: string; count: number }[];
  trustScoreDistribution: { range: string; count: number }[];
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
}

export interface PaginatedData<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
