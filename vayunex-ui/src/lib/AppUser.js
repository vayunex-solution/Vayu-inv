// src/lib/AppUser.js
// Shared authentication state singleton

class AppUser {
  static instance = null;
  
  constructor() {
    this.id = null;
    this.email = null;
    this.username = null;
    this.role = null;
    this.permissions = [];
    this.accessToken = null;
    this.refreshToken = null;
    
    // Load from sessionStorage on init
    this._loadFromStorage();
  }
  
  static getInstance() {
    if (!AppUser.instance) {
      AppUser.instance = new AppUser();
    }
    return AppUser.instance;
  }
  
  static setUser(userData, tokens = {}) {
    const user = AppUser.getInstance();
    user.id = userData.id;
    user.email = userData.email;
    user.username = userData.username;
    user.role = userData.role;
    user.permissions = userData.permissions || [];
    user.accessToken = tokens.accessToken;
    user.refreshToken = tokens.refreshToken;
    
    user._saveToStorage();
  }
  
  static isLoggedIn() {
    const user = AppUser.getInstance();
    return !!(user.accessToken && user.id);
  }
  
  static getToken() {
    return AppUser.getInstance().accessToken;
  }
  
  static hasPermission(permission) {
    const user = AppUser.getInstance();
    if (user.role === 'admin') return true;
    return user.permissions.includes(permission);
  }
  
  static clear() {
    const user = AppUser.getInstance();
    user.id = null;
    user.email = null;
    user.username = null;
    user.role = null;
    user.permissions = [];
    user.accessToken = null;
    user.refreshToken = null;
    
    sessionStorage.removeItem('vayunex_user');
  }
  
  _saveToStorage() {
    const data = {
      id: this.id,
      email: this.email,
      username: this.username,
      role: this.role,
      permissions: this.permissions,
      accessToken: this.accessToken,
      refreshToken: this.refreshToken
    };
    sessionStorage.setItem('vayunex_user', JSON.stringify(data));
  }
  
  _loadFromStorage() {
    try {
      const stored = sessionStorage.getItem('vayunex_user');
      if (stored) {
        const data = JSON.parse(stored);
        this.id = data.id;
        this.email = data.email;
        this.username = data.username;
        this.role = data.role;
        this.permissions = data.permissions || [];
        this.accessToken = data.accessToken;
        this.refreshToken = data.refreshToken;
      }
    } catch (e) {
      console.error('Failed to load user from storage:', e);
    }
  }
}

export default AppUser;
