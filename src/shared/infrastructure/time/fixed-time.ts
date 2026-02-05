import { DateTime } from 'luxon';
import { ITimeProvider } from '../../kernel/time.ts';

/**
 * Mock implementation for testing.
 * 
 * @module Infrastructure
 */
export class FixedTime implements ITimeProvider {
  private _fixedTime: Date;

  constructor(fixedTime: Date) {
    this._fixedTime = fixedTime;
  }

  now(): Date {
    return new Date(this._fixedTime);
  }

  normalize(date: Date | string, _sourceZone?: string): Date {
    if (date instanceof Date) {
      return date;
    }
    return new Date(date);
  }

  denormalize(date: Date, targetZone?: string): DateTime {
    const zone = targetZone || 'UTC';
    return DateTime.fromJSDate(date).setZone(zone);
  }

  setTime(newTime: Date): void {
    this._fixedTime = newTime;
  }
}
