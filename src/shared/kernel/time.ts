import { DateTime } from 'luxon';

/**
 * Interface for providing the current time.
 * Essential for testability to avoid hidden dependencies on new Date().
 * 
 * @module Kernel
 */
export interface ITimeProvider {
  /**
   * Returns current time in UTC (Date).
   * Used for storing time in DB or internal processing.
   */
  now(): Date;

  /**
   * Converts input to UTC Date.
   * Useful when receiving zoned time from external systems.
   */
  normalize(date: Date | string, sourceZone?: string): Date;

  /**
   * Converts UTC Date to DateTime in target zone.
   * Use this for "projections" -> displaying time to user or domain logic requiring specific TZ.
   */
  denormalize(date: Date, targetZone?: string): DateTime;
}
