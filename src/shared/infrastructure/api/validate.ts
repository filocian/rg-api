import { z } from "zod";
import { AppError } from "../errors/app-error.ts";

/**
 * Validates data against a Zod schema.
 * Throws AppError with BAD_REQUEST code if validation fails.
 * 
 * @param schema - The Zod schema to validate against
 * @param data - The data to validate
 * @returns The validated and typed data
 * @throws AppError if validation fails
 * 
 * @example
 * const data = validate(LoginSchema, await c.req.json());
 */
export function validate<T>(schema: z.ZodSchema<T>, data: unknown): T {
    const result = schema.safeParse(data);
    if (!result.success) {
        throw AppError.validation(result.error);
    }
    return result.data;
}

/**
 * Validates data and returns a result object instead of throwing.
 * Useful for conditional validation scenarios.
 * 
 * @param schema - The Zod schema to validate against
 * @param data - The data to validate
 * @returns Object with success boolean and either data or error
 */
export function tryValidate<T>(
    schema: z.ZodSchema<T>,
    data: unknown
): { success: true; data: T } | { success: false; error: z.ZodError } {
    const result = schema.safeParse(data);
    if (result.success) {
        return { success: true, data: result.data };
    }
    return { success: false, error: result.error };
}
