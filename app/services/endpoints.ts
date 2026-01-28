// API Endpoints Configuration

export const endpoints = {
  // User endpoints
  user: {
    register: '/auth/register',
    login: '/auth/login',
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
    exchangesList: '/admin/exchanges/list',
    pages: '/admin/pages',
  },

  // Public endpoints
  public: {
    features: '/landing/features',
  },
};
