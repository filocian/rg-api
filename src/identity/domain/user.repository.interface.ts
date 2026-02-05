export interface User {
    id: string;
    tenant_id: string;
    email: string;
    password_hash: string;
    token_version: number;
    created_at: Date;
    updated_at: Date;
}

import { TenantContext } from '../../shared/kernel/multi-tenancy/tenant-context.ts';

export interface IUserRepository {
    findById(id: string, context: TenantContext): Promise<User | null>;
    findByEmail(email: string, context: TenantContext): Promise<User | null>;
    create(user: Omit<User, 'id' | 'created_at' | 'updated_at' | 'token_version'>, context: TenantContext): Promise<User>;
    update(id: string, data: Partial<Omit<User, 'id' | 'created_at' | 'updated_at'>>, context: TenantContext): Promise<User>;
    incrementTokenVersion(id: string, context: TenantContext): Promise<void>;
}
