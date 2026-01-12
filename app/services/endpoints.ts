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
    userDetail: (id: number) => `/admin/users/${id}`,
  },

  // Public endpoints
  public: {
    features: '/landing/features',
  },
};
