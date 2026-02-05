import { assert, assertEquals } from "https://deno.land/std@0.208.0/assert/mod.ts";
import { exists } from "https://deno.land/std@0.208.0/fs/exists.ts";
import { join } from "https://deno.land/std@0.208.0/path/mod.ts";
import { AppError } from "../errors/app-error.ts";
import { logger } from "./logger.ts";

const STORAGE_PATH = "./storage/logs";

Deno.test("Logger - Should log INFO with code and persistence", async () => {
    const code = "USER_LOGIN";
    const msg = "User logged in";
    interface LoginDetails { userId: string; }
    const details: LoginDetails = { userId: "123" };
    
    logger.info<LoginDetails>(code, msg, details);
    
    // Allow async write
    await new Promise(r => setTimeout(r, 100));

    const dateStr = new Date().toISOString().split('T')[0];
    // New Path: storage/logs/info/YYYY-MM-DD.log (Flatter structure)
    const filePath = join(STORAGE_PATH, "info", `${dateStr}.log`);
    
    assert(await exists(filePath), "Log file should exist");
    
    const content = await Deno.readTextFile(filePath);
    const lastLine = content.trim().split('\n').pop()!;
    const entry = JSON.parse(lastLine);
    
    assertEquals(entry.code, code);
    assertEquals(entry.message, msg);
    // @ts-ignore: details is untyped in JSON
    assertEquals(entry.details.userId, details.userId);
    assertEquals(entry.severity, "info");
});


Deno.test("Logger - Should log AppError correctly", async () => {
    // Use factory method for new AppError
    const appErr = AppError.from("VALIDATION_ERROR", "Invalid email", { 
        details: { field: "email" },
        severity: 'warn'  // Simulate a warning level validation error
    });
    
    logger.error(appErr);
    
    await new Promise(r => setTimeout(r, 100));

    // Should appear in warn/ folder
    const dateStr = new Date().toISOString().split('T')[0];
    const filePath = join(STORAGE_PATH, "warn", `${dateStr}.log`);
    
    assert(await exists(filePath), "Error log file should exist in warn folder");
    
    const content = await Deno.readTextFile(filePath);
    const lastLine = content.trim().split('\n').pop()!;
    const entry = JSON.parse(lastLine);
    
    assertEquals(entry.code, "VALIDATION_ERROR");
    assertEquals(entry.message, "Invalid email");
    assertEquals(entry.details.field, "email");
    assertEquals(entry.severity, "warn");
});

Deno.test("Logger - Should log Fatal Error from Global Handler Simulation", async () => {
    // Simulate what global-error.ts does for unknown errors
    const rawError = new Error("Database disconnected");
    const appErr = AppError.fatal("Unexpected error", rawError);
    
    logger.error(appErr);
    
    await new Promise(r => setTimeout(r, 100));

    const dateStr = new Date().toISOString().split('T')[0];
    const filePath = join(STORAGE_PATH, "fatal", `${dateStr}.log`);
    
    assert(await exists(filePath), "Fatal log file should exist");
    
    const content = await Deno.readTextFile(filePath);
    const lastLine = content.trim().split('\n').pop()!;
    const entry = JSON.parse(lastLine);
    
    assertEquals(entry.code, "INTERNAL_ERROR");
    assertEquals(entry.code, "INTERNAL_ERROR");
    assertEquals(entry.severity, "fatal");
    // The main message should be the one from AppError
    assertEquals(entry.error.message, "Unexpected error");
    // The original error should be in details
    // @ts-ignore: details structure is known
});
