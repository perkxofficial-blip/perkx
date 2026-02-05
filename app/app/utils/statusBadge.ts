// Common status badge utility functions

export type StatusType = 'ACTIVE' | 'PENDING' | 'REJECTED' | 'INACTIVE' | 'DEACTIVATE';

export interface StatusBadgeStyle {
  bg: string;
  text: string;
}

/**
 * Get status badge styles for exchanges
 */
export const getExchangeStatusBadge = (status: string): StatusBadgeStyle => {
  switch (status.toUpperCase()) {
    case 'ACTIVE':
      return {
        bg: 'bg-green-100 dark:bg-green-900/30',
        text: 'text-green-800 dark:text-green-400'
      };
    case 'PENDING':
      return {
        bg: 'bg-yellow-100 dark:bg-yellow-900/30',
        text: 'text-yellow-800 dark:text-yellow-400'
      };
    case 'REJECTED':
      return {
        bg: 'bg-red-100 dark:bg-red-900/30',
        text: 'text-red-800 dark:text-red-400'
      };
    default:
      return {
        bg: 'bg-gray-100 dark:bg-gray-700',
        text: 'text-gray-800 dark:text-gray-400'
      };
  }
};

/**
 * Get status badge styles for users
 */
export const getUserStatusBadge = (status: string): StatusBadgeStyle => {
  switch (status.toUpperCase()) {
    case 'ACTIVE':
      return {
        bg: 'bg-green-100 dark:bg-green-900/20',
        text: 'text-green-800 dark:text-green-400'
      };
    case 'INACTIVE':
      return {
        bg: 'bg-yellow-100 dark:bg-yellow-900/20',
        text: 'text-yellow-800 dark:text-yellow-400'
      };
    case 'DEACTIVATE':
      return {
        bg: 'bg-red-100 dark:bg-red-900/20',
        text: 'text-red-800 dark:text-red-400'
      };
    default:
      return {
        bg: 'bg-gray-100 dark:bg-gray-700',
        text: 'text-gray-800 dark:text-gray-400'
      };
  }
};

/**
 * Generic status badge getter (fallback to exchange status)
 */
export const getStatusBadge = getExchangeStatusBadge;
