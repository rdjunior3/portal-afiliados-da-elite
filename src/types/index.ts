// Re-export all types from their specific modules
export * from './affiliate.types';
export * from './product.types';
export * from './commission.types';
export * from './database.types';

// Common types
export interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  success: boolean;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// Form types
export interface LoginForm {
  email: string;
  password: string;
}

export interface SignupForm {
  email: string;
  password: string;
  fullName?: string;
  confirmPassword?: string;
}

// Theme types
export type Theme = 'light' | 'dark' | 'system'; 