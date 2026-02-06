import { assertEquals, assertRejects } from "jsr:@std/assert";
import { AppError } from "../../../shared/infrastructure/errors/app-error.ts";
import { ITenantRepository } from "../../domain/tenant.repository.interface.ts";
import { CreateTenantCommand } from "./create-tenant.command.ts";
import { CreateTenantHandler } from "./create-tenant.handler.ts";

// Fix AppError type for assertRejects
// deno-lint-ignore no-explicit-any
const AppErrorClass = AppError as any;

const now = new Date();

// Mocks
const mockTenantRepo = {
    create: () => Promise.resolve({} as any),
    findBySlug: () => Promise.resolve(null),
} as unknown as ITenantRepository;

Deno.test("CreateTenantHandler Scenarios", async (t) => {
    
    const handler = new CreateTenantHandler(mockTenantRepo);

    await t.step("Should create tenant successfully", async () => {
        mockTenantRepo.create = async (data) => ({
            id: "tenant-1",
            slug: data.slug,
            name: data.name || data.slug,
            created_at: now,
            updated_at: now
        });

        const command = new CreateTenantCommand("new-tenant", "New Tenant");
        const result = await handler.handle(command);

        assertEquals(result.slug, "new-tenant");
        assertEquals(result.name, "New Tenant");
    });

    await t.step("Should throw CONFLICT if slug exists (DB error 23505)", async () => {
        mockTenantRepo.create = async () => {
            const err: any = new Error("Unique violation");
            err.code = '23505';
            throw err;
        };

        const command = new CreateTenantCommand("existing-tenant");
        await assertRejects(
            () => handler.handle(command),
            AppErrorClass,
            "Tenant slug already exists"
        );
    });

    await t.step("Should rethrow other errors", async () => {
        mockTenantRepo.create = async () => {
            throw new Error("DB connection failed");
        };

        const command = new CreateTenantCommand("fail-tenant");
        await assertRejects(
            () => handler.handle(command),
            Error,
            "DB connection failed"
        );
    });
});
