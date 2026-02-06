import { Hono } from 'hono';
import { cqBus } from '../shared/infrastructure/bus/cqBus.ts';

// Middlewares
import { authMiddleware } from './infrastructure/middleware/auth.middleware.ts';
import { dbContextMiddleware } from './infrastructure/middleware/db-context.middleware.ts';

// --- Repositories ---
import { SqlPermissionRepository } from './infrastructure/repositories/sql-permission.repository.ts';
import { SqlRoleRepository } from './infrastructure/repositories/sql-role.repository.ts';
import { SqlSessionRepository } from './infrastructure/repositories/sql-session.repository.ts';
import { SqlTenantRepository } from './infrastructure/repositories/sql-tenant.repository.ts';
import { SqlUserRepository } from './infrastructure/repositories/sql-user.repository.ts';

// --- Auth Handlers ---
import { LoginCommand } from './features/login/login.command.ts';
import { LoginHandler } from './features/login/login.handler.ts';
import { postLogin } from './features/login/post.login.endpoint.ts';
import { LogoutCommand } from './features/logout/logout.command.ts';
import { LogoutHandler } from './features/logout/logout.handler.ts';
import { postLogout } from './features/logout/post.logout.endpoint.ts';
import { postRefreshToken } from './features/refresh-token/post.refresh-token.endpoint.ts';
import { RefreshTokenCommand } from './features/refresh-token/refresh-token.command.ts';
import { RefreshTokenHandler } from './features/refresh-token/refresh-token.handler.ts';
import { postRevokeAccess } from './features/revoke-access/post.revoke-access.endpoint.ts';
import { RevokeAccessCommand } from './features/revoke-access/revoke-access.command.ts';
import { RevokeAccessHandler } from './features/revoke-access/revoke-access.handler.ts';

// --- Tenant Handlers ---
import { CreateTenantCommand } from './features/create-tenant/create-tenant.command.ts';
import { CreateTenantHandler } from './features/create-tenant/create-tenant.handler.ts';
import { postTenant } from './features/create-tenant/post.create-tenant.endpoint.ts';
import { DeleteTenantCommand } from './features/delete-tenant/delete-tenant.command.ts';
import { DeleteTenantHandler } from './features/delete-tenant/delete-tenant.handler.ts';
import { deleteTenant } from './features/delete-tenant/delete.delete-tenant.endpoint.ts';
import { getTenant } from './features/get-tenant/get.get-tenant.endpoint.ts';
import { patchTenant } from './features/update-tenant/patch.update-tenant.endpoint.ts';
import { UpdateTenantCommand } from './features/update-tenant/update-tenant.command.ts';
import { UpdateTenantHandler } from './features/update-tenant/update-tenant.handler.ts';

// --- Role Handlers ---
import { CreateRoleCommand } from './features/create-role/create-role.command.ts';
import { CreateRoleHandler } from './features/create-role/create-role.handler.ts';
import { postRole } from './features/create-role/post.create-role.endpoint.ts';
import { DeleteRoleCommand } from './features/delete-role/delete-role.command.ts';
import { DeleteRoleHandler } from './features/delete-role/delete-role.handler.ts';
import { deleteRoleEndpoint } from './features/delete-role/delete.delete-role.endpoint.ts';
import { updateRoleEndpoint } from './features/update-role/patch.update-role.endpoint.ts';
import { UpdateRoleCommand } from './features/update-role/update-role.command.ts';
import { UpdateRoleHandler } from './features/update-role/update-role.handler.ts';

// --- Permission Handlers ---
import { AddPermissionCommand } from './features/add-permission/add-permission.command.ts';
import { AddPermissionHandler } from './features/add-permission/add-permission.handler.ts';
import { addPermissionEndpoint } from './features/add-permission/post.add-permission.endpoint.ts';
import { getPermissions } from './features/get-permissions/get.get-permissions.endpoint.ts';
import { removePermissionEndpoint } from './features/remove-permission/delete.remove-permission.endpoint.ts';
import { RemovePermissionCommand } from './features/remove-permission/remove-permission.command.ts';
import { RemovePermissionHandler } from './features/remove-permission/remove-permission.handler.ts';


import { PostgresDataRouter } from '../shared/infrastructure/database/data-router.ts';

import { MockRegionMetadataStore } from '../shared/infrastructure/multi-tenancy/mock-region-metadata-store.ts';

import { DenoKvCache } from '../shared/infrastructure/cache/deno-kv-cache.ts';
import { InMemoryCache } from '../shared/infrastructure/cache/in-memory-cache.ts';

// --- FACTORY / INSTANTIATION ---
const dataRouter = new PostgresDataRouter();
const regionStore = new MockRegionMetadataStore(); // Shared instance
const tenantRepo = new SqlTenantRepository();

const cacheStore = new DenoKvCache();
const localCacheStore = new InMemoryCache();
const userRepo = new SqlUserRepository(dataRouter, cacheStore, localCacheStore);

const sessionRepo = new SqlSessionRepository();
const roleRepo = new SqlRoleRepository();
const permissionRepo = new SqlPermissionRepository();

// --- REGISTRATION ---
cqBus.registerCommand(LoginCommand.name, new LoginHandler(tenantRepo, userRepo, sessionRepo, permissionRepo, regionStore));
cqBus.registerCommand(RefreshTokenCommand.name, new RefreshTokenHandler(sessionRepo, userRepo, tenantRepo, permissionRepo));
cqBus.registerCommand(RevokeAccessCommand.name, new RevokeAccessHandler(userRepo, sessionRepo));
cqBus.registerCommand(LogoutCommand.name, new LogoutHandler(sessionRepo));
cqBus.registerCommand(CreateTenantCommand.name, new CreateTenantHandler(tenantRepo));
cqBus.registerCommand(UpdateTenantCommand.name, new UpdateTenantHandler(tenantRepo));
cqBus.registerCommand(DeleteTenantCommand.name, new DeleteTenantHandler(tenantRepo));
cqBus.registerCommand(CreateRoleCommand.name, new CreateRoleHandler(roleRepo));
cqBus.registerCommand(UpdateRoleCommand.name, new UpdateRoleHandler(roleRepo));
cqBus.registerCommand(DeleteRoleCommand.name, new DeleteRoleHandler(roleRepo));
cqBus.registerCommand(AddPermissionCommand.name, new AddPermissionHandler(permissionRepo, roleRepo));
cqBus.registerCommand(RemovePermissionCommand.name, new RemovePermissionHandler(permissionRepo, roleRepo));


// --- ROUTES ---
const app = new Hono();

// Public
app.post('/auth/login', postLogin);
app.post('/auth/refresh', postRefreshToken);
app.post('/tenants', postTenant);
app.get('/tenants/:slug', getTenant);

// Protected
app.use('/*', authMiddleware);
app.use('/*', dbContextMiddleware);

app.post('/auth/revoke', postRevokeAccess);
app.post('/auth/logout', postLogout);

// Tenants Management (Protected)
app.patch('/tenants/:tenantId', patchTenant);
app.delete('/tenants/:tenantId', deleteTenant);

// Roles Management
app.post('/roles', postRole);
app.patch('/roles/:roleId', updateRoleEndpoint);
app.delete('/roles/:roleId', deleteRoleEndpoint);

// Permissions Management
app.get('/me/permissions', getPermissions);
app.post('/roles/:roleId/permissions', addPermissionEndpoint);
app.delete('/roles/:roleId/permissions/:scope', removePermissionEndpoint);

export const identityRoutes = app;
