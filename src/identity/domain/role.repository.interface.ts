export interface Role {
    id: string;
    tenant_id: string;
    name: string;
    parent_role_id: string | null;
    created_at: Date;
}

export interface IRoleRepository {
    findById(id: string): Promise<Role | null>;
    findByName(tenantId: string, name: string): Promise<Role | null>;
    create(role: Omit<Role, 'id' | 'created_at'>): Promise<Role>;
    update(id: string, data: Partial<Omit<Role, 'id' | 'created_at' | 'tenant_id'>>): Promise<Role>;
    delete(id: string): Promise<void>;
    assignToUser(userId: string, roleId: string): Promise<void>;
    removeFromUser(userId: string, roleId: string): Promise<void>;
}
