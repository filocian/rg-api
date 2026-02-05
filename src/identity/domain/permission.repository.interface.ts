export interface Permission {
    id: string;
    scope: string;
    description: string | null;
}

export interface PermissionScope {
    scope: string;
}

export interface IPermissionRepository {
    findByScope(scope: string): Promise<Permission | null>;
    create(permission: Omit<Permission, 'id'>): Promise<Permission>;
    assignToRole(roleId: string, permissionId: string): Promise<void>;
    removeFromRole(roleId: string, permissionId: string): Promise<void>;
    getEffectivePermissions(userId: string): Promise<string[]>;
}
