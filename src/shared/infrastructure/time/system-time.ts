import { DateTime } from 'luxon';
import { ITimeProvider } from '../../kernel/time.ts';

/**
 * Real implementation using system time and Luxon.
 * 
 * @module Infrastructure
 */
export class SystemTime implements ITimeProvider {
  /**
   * Returns current time in UTC (Date).
   * Used for storing time in DB or internal processing.
   */
  now(): Date {
    return DateTime.now().toUTC().toJSDate();
  }

  /**
   * Converts input to UTC Date.
   * Useful when receiving zoned time from external systems.
   */
  normalize(date: Date | string, sourceZone?: string): Date {
    if (date instanceof Date) {
      return DateTime.fromJSDate(date, { zone: sourceZone || 'UTC' }).toUTC().toJSDate();
    }
    // Assume string is ISO or similar parsable by luxon
    // If sourceZone is provided, treat input as being in that zone
    const dt = sourceZone
      ? DateTime.fromISO(date, { zone: sourceZone })
      : DateTime.fromISO(date); // Will parse offset if present, or use system/default

    return dt.toUTC().toJSDate();
  }

  /**
   * Converts UTC Date to DateTime in target zone.
   * Use this for "projections" -> displaying time to user or domain logic requiring specific TZ.
   * Defaults to APP_TIMEZONE env var.
   */
  denormalize(date: Date, targetZone?: string): DateTime {
    const zone = targetZone || Deno.env.get('APP_TIMEZONE') || 'UTC';
    return DateTime.fromJSDate(date).setZone(zone);
  }
}

// Default instance
export const systemTime = new SystemTime();
