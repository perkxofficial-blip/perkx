// Authentication helper functions

export const auth = {
  // User token management
  setUserToken(token: string) {
    document.cookie = `token=${token}; path=/; max-age=${7 * 24 * 60 * 60}`; // 7 days
  },

  getUserToken(): string | null {
    const cookie = document.cookie
      .split('; ')
      .find(row => row.startsWith('token='));
    return cookie ? cookie.split('=')[1] : null;
  },

  clearUserToken() {
    document.cookie = 'token=; path=/; max-age=0';
  },

  // Admin token management
  setAdminToken(token: string) {
    document.cookie = `admin_token=${token}; path=/; max-age=${24 * 60 * 60}`; // 1 day
  },

  getAdminToken(): string | null {
    const cookie = document.cookie
      .split('; ')
      .find(row => row.startsWith('admin_token='));
    return cookie ? cookie.split('=')[1] : null;
  },

  clearAdminToken() {
    document.cookie = 'admin_token=; path=/; max-age=0';
  },

  // Check if user is authenticated
  isUserAuthenticated(): boolean {
    return !!this.getUserToken();
  },

  // Check if admin is authenticated
  isAdminAuthenticated(): boolean {
    return !!this.getAdminToken();
  },
};
