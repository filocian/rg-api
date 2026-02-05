import { assertEquals, assertExists } from "https://deno.land/std@0.224.0/assert/mod.ts";
import { AppError } from "../errors/app-error.ts";
import { errorResponse, successResponse } from "./envelope.ts";

Deno.test("API Envelope - Success Response", () => {
    const data = { id: 1, name: "Test" };
    const response = successResponse(data, { version: "1.0" });

    assertEquals(response.success, true);
    assertEquals(response.data, data);
    assertEquals(response.meta.version, "1.0");
    assertExists(response.meta.timestamp);
});

Deno.test("API Envelope - Error Response via Factory", () => {
    const error = AppError.from("NOT_FOUND", "Resource not found", { details: { id: 123 } });
    const response = errorResponse(error, "trace-123");

    assertEquals(response.success, false);
    assertEquals(response.error.code, "NOT_FOUND");
    assertEquals(response.error.message, "Resource not found");
    assertEquals(response.error.details.id, 123);
    assertEquals(response.error.traceId, "trace-123");
});

Deno.test("AppError - Default Status Codes", () => {
    const err1 = AppError.from("BAD_REQUEST", "Bad request");
    assertEquals(err1.httpStatus, 400);

    const err2 = AppError.from("UNAUTHORIZED", "Unauthorized");
    assertEquals(err2.httpStatus, 401);

    const err3 = AppError.from("INTERNAL_ERROR", "Internal error");
    assertEquals(err3.httpStatus, 500);
});

Deno.test("AppError - Custom Status via Config", () => {
    const err = AppError.from("CONFLICT", "Custom Conflict", { httpStatus: 418, details: { tea: true } });
    assertEquals(err.code, "CONFLICT");
    assertEquals(err.httpStatus, 418);
    assertEquals(err.details!.tea, true);
});
