/**
 * @file api.ts
 * @description Strict engineering types for API communication.
 */

export type ApiResponse<T = any> = {
  success: boolean;
  data: T | null;
  error?: {
    code: string;
    message: string;
    // Backend semantic code (e.g. MFA_REQUIRED, ACCOUNT_LOCKED, NOT_FOUND),
    // distinct from the transport-level HTTP_<status> code above.
    appCode?: string;
  };
  meta?: {
    total: number;
    page: number;
    limit: number;
  };
  timestamp: string;
};

export type ServiceResponse<T = any> = {
  success: boolean;
  data?: T;
  errorCode?: string;
  message?: string;
};

export interface IRepository<T> {
  create(data: Omit<T, 'id' | 'createdAt' | 'updatedAt'>): Promise<T>;
  findById(id: string): Promise<T | null>;
  update(id: string, data: Partial<T>): Promise<T | null>;
  delete(id: string): Promise<boolean>;
  find(filters: object): Promise<T[]>;
}
