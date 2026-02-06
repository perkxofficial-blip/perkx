/**
 * Common date formatting utilities for admin pages
 */

/**
 * Format date to "DD MMM YYYY" format
 * @param dateString - Date string to format
 * @returns Formatted date string or '-' if invalid
 */
export const formatDate = (dateString?: string) => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, '0');
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const month = months[date.getMonth()];
  const year = date.getFullYear();
  return `${day} ${month} ${year}`;
};

/**
 * Format date time to "DD MMM YYYY, HH:MM:SS" format
 * @param dateString - Date string to format
 * @returns Formatted date time string or '-' if invalid
 */
export const formatDateTime = (dateString?: string) => {
  if (!dateString) return '-';
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, '0');
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const month = months[date.getMonth()];
  const year = date.getFullYear();
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');
  return `${day} ${month} ${year}, ${hours}:${minutes}:${seconds}`;
};

/**
 * Format date time for HTML input datetime-local
 * @param dateString - Date string to format
 * @returns Formatted string for datetime-local input or empty string if invalid
 */
export const formatDateTimeForInput = (dateString?: string) => {
  if (!dateString) return '';
  try {
    // Parse ISO string directly to avoid timezone conversion
    // Expected format: "2024-01-15T10:30:00.000Z" or "2024-01-15T10:30:00"
    const isoMatch = dateString.match(/(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/);
    if (isoMatch) {
      const [, year, month, day, hour, minute] = isoMatch;
      return `${year}-${month}-${day}T${hour}:${minute}`;
    }
    return '';
  } catch {
    return '';
  }
};