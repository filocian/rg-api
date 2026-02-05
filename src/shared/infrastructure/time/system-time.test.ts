import { assertEquals, assertInstanceOf } from '@std/assert';
import { DateTime } from 'luxon';
import { systemTime } from './system-time.ts';

Deno.test('SystemTime.now returns a valid date', () => {
  const now = systemTime.now();
  assertInstanceOf(now, Date);
  const diff = Math.abs(new Date().getTime() - now.getTime());
  assertEquals(diff < 1000, true); // Should be very close to system time
});

Deno.test('SystemTime.denormalize converts valid date to DateTime', () => {
  const now = new Date('2023-10-01T12:00:00Z');
  const dt = systemTime.denormalize(now, 'UTC');
  assertInstanceOf(dt, DateTime);
  assertEquals(dt.toJSDate().toISOString(), now.toISOString());
});

Deno.test('SystemTime.denormalize handles timezone correctly', () => {
  const utcDate = new Date('2023-10-01T12:00:00Z');
  
  // Test with a specific timezone (e.g., America/New_York is UTC-4 in October)
  const nyTime = systemTime.denormalize(utcDate, 'America/New_York');
  assertEquals(nyTime.zoneName, 'America/New_York');
  assertEquals(nyTime.hour, 8); // 12:00 UTC - 4 hours = 08:00
});

Deno.test('SystemTime.normalize converts string to UTC Date', () => {
  const input = '2023-10-01T08:00:00-04:00'; // 08:00 in UTC-4 is 12:00 UTC
  const normalized = systemTime.normalize(input);
  
  assertEquals(normalized.toISOString(), '2023-10-01T12:00:00.000Z');
});

Deno.test('SystemTime.normalize converts Date to UTC Date', () => {
  const input = new Date('2023-10-01T12:00:00Z');
  const normalized = systemTime.normalize(input);
  
  assertEquals(normalized.toISOString(), '2023-10-01T12:00:00.000Z');
});

Deno.test('SystemTime.denormalize uses APP_TIMEZONE env var', () => {
  Deno.env.set('APP_TIMEZONE', 'Europe/Paris');
  const utcDate = new Date('2023-10-01T12:00:00Z'); // Summer time in Paris is UTC+2
  
  try {
    const localTime = systemTime.denormalize(utcDate);
    assertEquals(localTime.zoneName, 'Europe/Paris');
    assertEquals(localTime.hour, 14); // 12:00 UTC + 2 hours = 14:00
  } finally {
    Deno.env.delete('APP_TIMEZONE');
  }
});
