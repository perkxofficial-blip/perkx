import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';

// Extend dayjs with plugins
dayjs.extend(utc);
dayjs.extend(timezone);

/**
 * Get timezone from environment variable, default to Asia/Singapore (SGT - UTC+8)
 */
function getTimezone(): string {
  return process.env.TZ || process.env.TIMEZONE || 'Asia/Singapore';
}

/**
 * Convert a date to the configured timezone
 * @param date - Date object, string, or null/undefined
 * @param tz - Optional timezone override, defaults to env TZ/TIMEZONE or 'Asia/Singapore'
 * @returns ISO string in configured timezone or null if input is null/undefined
 */
export function convertToTimezone(date: Date | string | null | undefined, tz?: string): string | null {
  if (!date) {
    return null;
  }

  const timezone = tz || getTimezone();

  try {
    // Parse as UTC (from database), then convert to target timezone
    return dayjs.utc(date).tz(timezone).format();
  } catch (error) {
    return dayjs(date).toISOString();
  }
}

/**
 * Convert a date from UTC+8 (Asia/Singapore) to UTC
 * Used when saving dates from admin input (UTC+8) to database (UTC)
 * @param date - Date object, string, or null/undefined in UTC+8
 * @param tz - Optional timezone override, defaults to env TZ/TIMEZONE or 'Asia/Singapore'
 * @returns Date object in UTC or null if input is null/undefined
 */
export function convertToUTC(date: Date | string | null | undefined, tz?: string): Date | null {
  if (!date) {
    return null;
  }

  const timezone = tz || getTimezone();

  try {
    // Parse the date as if it's in UTC+8, then convert to UTC
    const utc8Date = dayjs.tz(date, timezone);
    return utc8Date.utc().toDate();
  } catch (error) {
    // Fallback: treat as UTC if parsing fails
    return dayjs(date).utc().toDate();
  }
}

/**
 * Recursively transform an object to convert all created_at and updated_at fields to configured timezone
 * @param obj - Any object, array, or primitive value
 * @param tz - Optional timezone override, defaults to env TZ/TIMEZONE or 'Asia/Singapore'
 * @returns Transformed object with dates converted to configured timezone
 */
export function transformDatesToTimezone<T>(obj: T, tz?: string): T {
  if (obj === null || obj === undefined) {
    return obj;
  }

  // Handle arrays
  if (Array.isArray(obj)) {
    return obj.map((item) => transformDatesToTimezone(item, tz)) as T;
  }

  // Handle objects
  if (typeof obj === 'object' && !(obj instanceof Date)) {
    const transformed: any = {};
    
    for (const [key, value] of Object.entries(obj)) {
      if (key === 'created_at' || key === 'updated_at') {
        transformed[key] = convertToTimezone(value, tz);
      } else {
        transformed[key] = transformDatesToTimezone(value, tz);
      }
    }
    
    return transformed as T;
  }

  return obj;
}
