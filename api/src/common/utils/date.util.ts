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
    return dayjs(date).tz(timezone).format();
  } catch (error) {
    return dayjs(date).toISOString();
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
