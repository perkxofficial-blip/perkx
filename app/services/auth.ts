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
    // Get the base domain for clearing domain-scoped cookies
    const hostname = window.location.hostname;
    let baseDomain = '';
    
    if (hostname.includes('localhost')) {
      baseDomain = '.localhost';
    } else if (hostname.includes('perkx.co')) {
      baseDomain = '.perkx.co';
    } else if (hostname.includes('perk.local')) {
      baseDomain = '.perk.local';
    } else {
      // For other domains, extract base domain
      const parts = hostname.split('.');
      if (parts.length >= 2) {
        baseDomain = '.' + parts.slice(-2).join('.');
      }
    }
    
    const cookieNames = ['token', 'verify-email'];
    const expireDate = 'Thu, 01 Jan 1970 00:00:00 GMT';
    
    for (const cookieName of cookieNames) {
      // 1. Clear for current domain
      document.cookie = `${cookieName}=; path=/; max-age=0; expires=${expireDate}`;
      
      // 2. Clear for base domain with dot prefix (e.g., .perk.local)
      if (baseDomain) {
        document.cookie = `${cookieName}=; path=/; domain=${baseDomain}; max-age=0; expires=${expireDate}`;
        
        // 3. Clear without the leading dot (e.g., perk.local)
        if (baseDomain.startsWith('.')) {
          const domainWithoutDot = baseDomain.substring(1);
          document.cookie = `${cookieName}=; path=/; domain=${domainWithoutDot}; max-age=0; expires=${expireDate}`;
        }
      }
    }
    
    console.log('[clearUserToken] Cookies cleared for domain:', baseDomain, '| Remaining:', document.cookie);
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
