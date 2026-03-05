import { Types } from 'mongoose';

// ─── Shared Paginated Response ────────────────────────────────────────────────
export interface PaginatedResult<T> {
    data: T[];
    total: number;
    page: number;
    limit: number;
}

// ─── Common Query Filters ────────────────────────────────────────────────────
export interface PaginationQuery {
    page?: number;
    limit?: number;
}

// ─── Auth ────────────────────────────────────────────────────────────────────
export interface LoginBody {
    email: string;
    password: string;
}

export interface AuthResponse {
    token: string;
    user: {
        id: string;
        email: string;
        role: string;
    };
}
