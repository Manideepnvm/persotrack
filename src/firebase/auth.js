import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  FacebookAuthProvider,
  signOut as firebaseSignOut,
  onAuthStateChanged as firebaseOnAuthStateChanged,
  sendPasswordResetEmail,
  sendEmailVerification as firebaseSendEmailVerification,
  updatePassword,
  updateProfile,
  deleteUser,
  reauthenticateWithCredential,
  EmailAuthProvider,
  updateEmail,
  verifyBeforeUpdateEmail,
  applyActionCode,
  checkActionCode,
  confirmPasswordReset,
  fetchSignInMethodsForEmail,
  linkWithPopup,
  unlink,
  multiFactor,
  PhoneAuthProvider,
  RecaptchaVerifier
} from 'firebase/auth';
import { auth } from './firebaseConfig';

// Custom error class for better error handling
class AuthError extends Error {
  constructor(message, code = null, originalError = null) {
    super(message);
    this.name = 'AuthError';
    this.code = code;
    this.originalError = originalError;
  }
}

// Auth state management
class AuthStateManager {
  constructor() {
    this.listeners = new Set();
    this.currentUser = null;
    this.isInitialized = false;
    this.initPromise = this.initialize();
  }

  async initialize() {
    return new Promise((resolve) => {
      const unsubscribe = firebaseOnAuthStateChanged(auth, (user) => {
        this.currentUser = user;
        this.isInitialized = true;
        this.notifyListeners(user);
        unsubscribe();
        resolve(user);
      });
    });
  }

  onAuthStateChanged(callback) {
    this.listeners.add(callback);
    
    // If already initialized, call immediately
    if (this.isInitialized) {
      callback(this.currentUser);
    }

    // Return unsubscribe function
    return () => {
      this.listeners.delete(callback);
    };
  }

  notifyListeners(user) {
    this.listeners.forEach(callback => {
      try {
        callback(user);
      } catch (error) {
        console.error('Error in auth state listener:', error);
      }
    });
  }

  async waitForInitialization() {
    if (this.isInitialized) return this.currentUser;
    return await this.initPromise;
  }
}

// Create singleton instance
const authStateManager = new AuthStateManager();

// Validation utilities
const validateEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!email) throw new AuthError('Email is required');
  if (!emailRegex.test(email)) throw new AuthError('Invalid email format');
  return true;
};

const validatePassword = (password, minLength = 6) => {
  if (!password) throw new AuthError('Password is required');
  if (password.length < minLength) {
    throw new AuthError(`Password must be at least ${minLength} characters long`);
  }
  return true;
};

const validatePasswordStrength = (password) => {
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumbers = /\d/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  
  if (password.length < 8) {
    throw new AuthError('Password must be at least 8 characters long');
  }
  if (!hasUpperCase || !hasLowerCase || !hasNumbers || !hasSpecialChar) {
    throw new AuthError('Password must contain uppercase, lowercase, number, and special character');
  }
  return true;
};

// Error handling utility
const handleAuthError = (error) => {
  const errorMessages = {
    'auth/email-already-in-use': 'An account with this email already exists',
    'auth/weak-password': 'Password is too weak. Please choose a stronger password',
    'auth/user-not-found': 'No account found with this email address',
    'auth/wrong-password': 'Incorrect password',
    'auth/invalid-email': 'Invalid email address',
    'auth/user-disabled': 'This account has been disabled',
    'auth/too-many-requests': 'Too many failed attempts. Please try again later',
    'auth/operation-not-allowed': 'This operation is not allowed',
    'auth/requires-recent-login': 'This operation requires recent authentication. Please log in again',
    'auth/email-not-verified': 'Please verify your email address before proceeding',
    'auth/invalid-verification-code': 'Invalid verification code',
    'auth/invalid-verification-id': 'Invalid verification ID',
    'auth/code-expired': 'Verification code has expired',
    'auth/missing-verification-code': 'Verification code is required',
    'auth/missing-verification-id': 'Verification ID is required'
  };

  const message = errorMessages[error.code] || error.message || 'An unexpected error occurred';
  throw new AuthError(message, error.code, error);
};

// Core Authentication Functions
export const authService = {
  // User Registration
  async signUp(email, password, options = {}) {
    try {
      validateEmail(email);
      if (options.enforceStrongPassword) {
        validatePasswordStrength(password);
      } else {
        validatePassword(password);
      }

      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Update profile if displayName provided
      if (options.displayName) {
        await updateProfile(user, { displayName: options.displayName });
      }

      // Send verification email if requested
      if (options.sendVerificationEmail !== false) {
        await firebaseSendEmailVerification(user);
      }

      return {
        user: {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          emailVerified: user.emailVerified,
          photoURL: user.photoURL
        },
        success: true
      };
    } catch (error) {
      handleAuthError(error);
    }
  },

  // User Sign In
  async signIn(email, password) {
    try {
      validateEmail(email);
      validatePassword(password);

      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      return {
        user: {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          emailVerified: user.emailVerified,
          photoURL: user.photoURL
        },
        success: true
      };
    } catch (error) {
      handleAuthError(error);
    }
  },

  // Social Authentication
  async signInWithGoogle() {
    try {
      const provider = new GoogleAuthProvider();
      provider.addScope('profile');
      provider.addScope('email');
      
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      return {
        user: {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          emailVerified: user.emailVerified,
          photoURL: user.photoURL
        },
        success: true,
        isNewUser: result._tokenResponse?.isNewUser || false
      };
    } catch (error) {
      handleAuthError(error);
    }
  },

  async signInWithFacebook() {
    try {
      const provider = new FacebookAuthProvider();
      provider.addScope('email');
      
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      return {
        user: {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          emailVerified: user.emailVerified,
          photoURL: user.photoURL
        },
        success: true,
        isNewUser: result._tokenResponse?.isNewUser || false
      };
    } catch (error) {
      handleAuthError(error);
    }
  },

  // Password Reset
  async resetPassword(email) {
    try {
      validateEmail(email);
      await sendPasswordResetEmail(auth, email);
      return { success: true, message: 'Password reset email sent successfully' };
    } catch (error) {
      handleAuthError(error);
    }
  },

  async confirmPasswordReset(oobCode, newPassword) {
    try {
      validatePassword(newPassword);
      await confirmPasswordReset(auth, oobCode, newPassword);
      return { success: true, message: 'Password reset successfully' };
    } catch (error) {
      handleAuthError(error);
    }
  },

  // Email Verification
  async sendEmailVerification(user = null) {
    try {
      const currentUser = user || auth.currentUser;
      if (!currentUser) throw new AuthError('No user is currently signed in');
      
      await firebaseSendEmailVerification(currentUser);
      return { success: true, message: 'Verification email sent successfully' };
    } catch (error) {
      handleAuthError(error);
    }
  },

  async verifyEmail(oobCode) {
    try {
      await applyActionCode(auth, oobCode);
      return { success: true, message: 'Email verified successfully' };
    } catch (error) {
      handleAuthError(error);
    }
  },

  // Profile Management
  async updateUserProfile(updates) {
    try {
      const user = auth.currentUser;
      if (!user) throw new AuthError('No user is currently signed in');

      await updateProfile(user, updates);
      return { 
        success: true, 
        message: 'Profile updated successfully',
        user: {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL
        }
      };
    } catch (error) {
      handleAuthError(error);
    }
  },

  async updateUserEmail(newEmail, currentPassword) {
    try {
      const user = auth.currentUser;
      if (!user) throw new AuthError('No user is currently signed in');

      validateEmail(newEmail);

      // Re-authenticate user before sensitive operation
      if (currentPassword) {
        const credential = EmailAuthProvider.credential(user.email, currentPassword);
        await reauthenticateWithCredential(user, credential);
      }

      await verifyBeforeUpdateEmail(user, newEmail);
      return { success: true, message: 'Email verification sent to new address' };
    } catch (error) {
      handleAuthError(error);
    }
  },

  async updateUserPassword(currentPassword, newPassword) {
    try {
      const user = auth.currentUser;
      if (!user) throw new AuthError('No user is currently signed in');

      validatePassword(newPassword);

      // Re-authenticate user
      const credential = EmailAuthProvider.credential(user.email, currentPassword);
      await reauthenticateWithCredential(user, credential);
      
      await updatePassword(user, newPassword);
      return { success: true, message: 'Password updated successfully' };
    } catch (error) {
      handleAuthError(error);
    }
  },

  // Account Management
  async deleteAccount(password) {
    try {
      const user = auth.currentUser;
      if (!user) throw new AuthError('No user is currently signed in');

      // Re-authenticate before deletion
      if (password) {
        const credential = EmailAuthProvider.credential(user.email, password);
        await reauthenticateWithCredential(user, credential);
      }

      await deleteUser(user);
      return { success: true, message: 'Account deleted successfully' };
    } catch (error) {
      handleAuthError(error);
    }
  },

  // Sign Out
  async signOut() {
    try {
      await firebaseSignOut(auth);
      return { success: true, message: 'Signed out successfully' };
    } catch (error) {
      handleAuthError(error);
    }
  },

  // User State Management
  getCurrentUser() {
    return auth.currentUser;
  },

  async waitForAuth() {
    return await authStateManager.waitForInitialization();
  },

  onAuthStateChanged(callback) {
    return authStateManager.onAuthStateChanged(callback);
  },

  // Utility Functions
  async checkEmailExists(email) {
    try {
      validateEmail(email);
      const methods = await fetchSignInMethodsForEmail(auth, email);
      return { exists: methods.length > 0, methods };
    } catch (error) {
      handleAuthError(error);
    }
  },

  async reauthenticate(password) {
    try {
      const user = auth.currentUser;
      if (!user) throw new AuthError('No user is currently signed in');

      const credential = EmailAuthProvider.credential(user.email, password);
      await reauthenticateWithCredential(user, credential);
      return { success: true, message: 'Re-authentication successful' };
    } catch (error) {
      handleAuthError(error);
    }
  },

  // Account Linking
  async linkWithGoogle() {
    try {
      const user = auth.currentUser;
      if (!user) throw new AuthError('No user is currently signed in');

      const provider = new GoogleAuthProvider();
      const result = await linkWithPopup(user, provider);
      
      return { 
        success: true, 
        message: 'Google account linked successfully',
        user: result.user 
      };
    } catch (error) {
      handleAuthError(error);
    }
  },

  async unlinkProvider(providerId) {
    try {
      const user = auth.currentUser;
      if (!user) throw new AuthError('No user is currently signed in');

      await unlink(user, providerId);
      return { success: true, message: `${providerId} account unlinked successfully` };
    } catch (error) {
      handleAuthError(error);
    }
  },

  // Get user token
  async getUserToken(forceRefresh = false) {
    try {
      const user = auth.currentUser;
      if (!user) throw new AuthError('No user is currently signed in');

      const token = await user.getIdToken(forceRefresh);
      return { token, success: true };
    } catch (error) {
      handleAuthError(error);
    }
  },

  // Check if user is authenticated
  isAuthenticated() {
    return !!auth.currentUser;
  },

  // Check if email is verified
  isEmailVerified() {
    return auth.currentUser?.emailVerified || false;
  }
};

// Export individual functions for backward compatibility
export const signUp = authService.signUp;
export const signIn = authService.signIn;
export const signInWithGoogle = authService.signInWithGoogle;
export const signInWithFacebook = authService.signInWithFacebook;
export const resetPassword = authService.resetPassword;
export const sendEmailVerification = authService.sendEmailVerification;
export const updateUserProfile = authService.updateUserProfile;
export const updateUserEmail = authService.updateUserEmail;
export const updateUserPassword = authService.updateUserPassword;
export const deleteAccount = authService.deleteAccount;
export const signOut = authService.signOut;
export const getCurrentUser = authService.getCurrentUser;
export const onAuthStateChanged = authService.onAuthStateChanged;
export const checkEmailExists = authService.checkEmailExists;
export const reauthenticate = authService.reauthenticate;
export const getUserToken = authService.getUserToken;
export const isAuthenticated = authService.isAuthenticated;
export const isEmailVerified = authService.isEmailVerified;

// Export the main service as default
export default authService;