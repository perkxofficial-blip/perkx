import { Transform } from 'class-transformer';
import { parseAsUTC8 } from '../utils/date.util';

/**
 * Transform decorator for date values from string to UTC+8 Date object
 * Parses the input string as UTC+8 (Asia/Singapore) and returns Date object
 * Used for campaign period dates (preview/launch/archive)
 */
export function TransformDateUTC8() {
  return Transform(({ value }) => {
    if (value === null || value === undefined || value === '') {
      return value;
    }
    
    // Parse string date as UTC+8 and return Date object
    return parseAsUTC8(value);
  });
}
