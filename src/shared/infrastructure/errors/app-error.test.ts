
import { assertEquals } from "https://deno.land/std@0.208.0/assert/mod.ts";
import { AppError } from "./app-error.ts";

Deno.test("AppError - Default Creation", () => {
    const err = AppError.from("INTERNAL_ERROR", "Something broke");
    assertEquals(err.code, "INTERNAL_ERROR");
    assertEquals(err.severity, "error");
    assertEquals(err.httpStatus, 500); 
    assertEquals(err.isOperational, true); // default
});

Deno.test("AppError - Validation Factory", () => {
    const details = { field: "email", reason: "invalid" };
    const err = AppError.validation(details);
    
    assertEquals(err.code, "VALIDATION_ERROR");
    assertEquals(err.severity, "warn");
    assertEquals(err.httpStatus, 422);
    assertEquals(err.details, details);
});

Deno.test("AppError - Not Found Factory", () => {
    const err = AppError.notFound("User not found");
    assertEquals(err.code, "RESOURCE_NOT_FOUND");
    assertEquals(err.severity, "warn");
    assertEquals(err.httpStatus, 404);
});

Deno.test("AppError - Fatal Factory", () => {
    const rootCause = new Error("DB Connection Lost");
    const err = AppError.fatal("Crash", rootCause);
    
    assertEquals(err.code, "INTERNAL_ERROR");
    assertEquals(err.severity, "fatal");
    assertEquals(err.httpStatus, 500);
    assertEquals(err.isOperational, false);
    assertEquals((err.details as any).name, "Error");
});

Deno.test("AppError - Custom Config", () => {
    const err = AppError.from("BAD_REQUEST", "Bad logic", {
        severity: 'info',
        isOperational: true,
        httpStatus: 400
    });
    
    assertEquals(err.severity, "info");
    assertEquals(err.httpStatus, 400);
});
