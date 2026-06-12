export type AuthUser = {
  id: string;
  name: string;
  role: 'patient' | 'admin';
  loginTime: Date;
};

export const mockAuth = {
  authenticate: (role: 'patient' | 'admin', name: string): AuthUser => {
    const user: AuthUser = {
      id: `${role}_${Date.now()}`,
      name,
      role,
      loginTime: new Date()
    };
    localStorage.setItem('pharma_auth_user', JSON.stringify(user));
    return user;
  },

  getCurrentUser: (): AuthUser | null => {
    const stored = localStorage.getItem('pharma_auth_user');
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch {
        return null;
      }
    }
    return null;
  },

  logout: (): void => {
    localStorage.removeItem('pharma_auth_user');
  },

  isAuthenticated: (): boolean => {
    return !!localStorage.getItem('pharma_auth_user');
  }
};
