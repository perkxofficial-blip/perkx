// API Endpoints Configuration

export const endpoints = {
  // User endpoints
  user: {
    register: '/auth/register',
    login: '/auth/login',
    forgotPassword: '/auth/forgot-password',
    resetPassword: '/auth/reset-password',
    verifyEmail: '/auth/verify-email',
    resendEmail: '/auth/resend',
    verifyOtp: '/auth/verify-otp',
    resendOtp: '/auth/resend-otp',
    profile: '/profile',
    updateProfile: '/profile',
  },

  // Admin endpoints
  admin: {
    login: '/admin/auth/login',
    users: '/admin/users',
    userDetail: (id: string | number) => `/admin/users/${id}`,
    userStatus: (id: string | number) => `/admin/users/${id}/status`,
    campaigns: '/admin/campaigns',
    campaignDetail: (id: string) => `/admin/campaigns/${id}`,
    exchanges: '/admin/exchanges',
    exchangesList: '/admin/exchanges/list',
    exchangesImport: '/admin/exchanges/import-products',
    pages: '/admin/pages',
  },

  // Public endpoints
  public: {
    exchanges: '/exchanges',
    campaigns: '/campaigns',
  },
};
