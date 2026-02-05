export interface Tenant {
    id: string;
    slug: string;
    name: string | null;
    created_at: Date;
    updated_at: Date;
}

export interface ITenantRepository {
    findById(id: string): Promise<Tenant | null>;
    findBySlug(slug: string): Promise<Tenant | null>;
    create(tenant: Omit<Tenant, 'id' | 'created_at' | 'updated_at'>): Promise<Tenant>;
    update(id: string, data: Partial<Omit<Tenant, 'id' | 'created_at' | 'updated_at'>>): Promise<Tenant>;
    delete(id: string): Promise<void>;
}
