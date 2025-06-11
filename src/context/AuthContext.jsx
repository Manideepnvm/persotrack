import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import authService from '../firebase/auth';

// Create Auth Context
const AuthContext = createContext();

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Auth Provider Component
export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [initialized, setInitialized] = useState(false);
  const [error, setError] = useState(null);

  // Clear error helper
  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Enhanced error handler
  const handleAuthError = useCallback((error, operation) => {
    console.error(`Auth error in ${operation}:`, error);
    setError({
      message: error.message || 'An unexpected error occurred',
      code: error.code || 'unknown',
      operation
    });
    return { success: false, error: error.message };
  }, []);

  // Sign Up function
  const signup = useCallback(async (email, password, options = {}) => {
    try {
      clearError();
      setLoading(true);
      const result = await authService.signUp(email, password, {
        displayName: options.displayName,
        sendVerificationEmail: options.sendVerificationEmail !== false,
        enforceStrongPassword: options.enforceStrongPassword || false
      });
      return { success: true, user: result.user };
    } catch (error) {
      return handleAuthError(error, 'signup');
    } finally {
      setLoading(false);
    }
  }, [clearError, handleAuthError]);

  // Sign In function
  const login = useCallback(async (email, password) => {
    try {
      clearError();
      setLoading(true);
      const result = await authService.signIn(email, password);
      return { success: true, user: result.user };
    } catch (error) {
      return handleAuthError(error, 'login');
    } finally {
      setLoading(false);
    }
  }, [clearError, handleAuthError]);

  // Social Sign In functions
  const loginWithGoogle = useCallback(async () => {
    try {
      clearError();
      setLoading(true);
      const result = await authService.signInWithGoogle();
      return { success: true, user: result.user, isNewUser: result.isNewUser };
    } catch (error) {
      return handleAuthError(error, 'google-login');
    } finally {
      setLoading(false);
    }
  }, [clearError, handleAuthError]);

  const loginWithFacebook = useCallback(async () => {
    try {
      clearError();
      setLoading(true);
      const result = await authService.signInWithFacebook();
      return { success: true, user: result.user, isNewUser: result.isNewUser };
    } catch (error) {
      return handleAuthError(error, 'facebook-login');
    } finally {
      setLoading(false);
    }
  }, [clearError, handleAuthError]);

  // Sign Out function
  const logout = useCallback(async () => {
    try {
      clearError();
      setLoading(true);
      await authService.signOut();
      return { success: true };
    } catch (error) {
      return handleAuthError(error, 'logout');
    } finally {
      setLoading(false);
    }
  }, [clearError, handleAuthError]);

  // Password Reset
  const resetPassword = useCallback(async (email) => {
    try {
      clearError();
      const result = await authService.resetPassword(email);
      return { success: true, message: result.message };
    } catch (error) {
      return handleAuthError(error, 'password-reset');
    }
  }, [clearError, handleAuthError]);

  // Email Verification
  const sendEmailVerification = useCallback(async () => {
    try {
      clearError();
      const result = await authService.sendEmailVerification();
      return { success: true, message: result.message };
    } catch (error) {
      return handleAuthError(error, 'email-verification');
    }
  }, [clearError, handleAuthError]);

  // Profile Update
  const updateProfile = useCallback(async (updates) => {
    try {
      clearError();
      setLoading(true);
      const result = await authService.updateUserProfile(updates);
      return { success: true, user: result.user };
    } catch (error) {
      return handleAuthError(error, 'profile-update');
    } finally {
      setLoading(false);
    }
  }, [clearError, handleAuthError]);

  // Email Update
  const updateEmail = useCallback(async (newEmail, currentPassword) => {
    try {
      clearError();
      setLoading(true);
      const result = await authService.updateUserEmail(newEmail, currentPassword);
      return { success: true, message: result.message };
    } catch (error) {
      return handleAuthError(error, 'email-update');
    } finally {
      setLoading(false);
    }
  }, [clearError, handleAuthError]);

  // Password Update
  const updatePassword = useCallback(async (currentPassword, newPassword) => {
    try {
      clearError();
      setLoading(true);
      const result = await authService.updateUserPassword(currentPassword, newPassword);
      return { success: true, message: result.message };
    } catch (error) {
      return handleAuthError(error, 'password-update');
    } finally {
      setLoading(false);
    }
  }, [clearError, handleAuthError]);

  // Delete Account
  const deleteAccount = useCallback(async (password) => {
    try {
      clearError();
      setLoading(true);
      const result = await authService.deleteAccount(password);
      return { success: true, message: result.message };
    } catch (error) {
      return handleAuthError(error, 'account-deletion');
    } finally {
      setLoading(false);
    }
  }, [clearError, handleAuthError]);

  // Re-authenticate
  const reauthenticate = useCallback(async (password) => {
    try {
      clearError();
      const result = await authService.reauthenticate(password);
      return { success: true, message: result.message };
    } catch (error) {
      return handleAuthError(error, 'reauthentication');
    }
  }, [clearError, handleAuthError]);

  // Check if email exists
  const checkEmailExists = useCallback(async (email) => {
    try {
      clearError();
      const result = await authService.checkEmailExists(email);
      return { success: true, exists: result.exists, methods: result.methods };
    } catch (error) {
      return handleAuthError(error, 'email-check');
    }
  }, [clearError, handleAuthError]);

  // Get user token
  const getUserToken = useCallback(async (forceRefresh = false) => {
    try {
      clearError();
      const result = await authService.getUserToken(forceRefresh);
      return { success: true, token: result.token };
    } catch (error) {
      return handleAuthError(error, 'token-retrieval');
    }
  }, [clearError, handleAuthError]);

  // Utility functions
  const isAuthenticated = useCallback(() => {
    return authService.isAuthenticated();
  }, []);

  const isEmailVerified = useCallback(() => {
    return authService.isEmailVerified();
  }, []);

  // Initialize auth state listener
  useEffect(() => {
    let isMounted = true;

    const initializeAuth = async () => {
      try {
        // Wait for auth to initialize
        await authService.waitForAuth();
        
        // Set up auth state listener
        const unsubscribe = authService.onAuthStateChanged((user) => {
          if (isMounted) {
            setCurrentUser(user);
            if (!initialized) {
              setInitialized(true);
            }
            setLoading(false);
          }
        });

        return unsubscribe;
      } catch (error) {
        console.error('Failed to initialize auth:', error);
        if (isMounted) {
          setError({
            message: 'Failed to initialize authentication',
            code: 'init-error',
            operation: 'initialization'
          });
          setLoading(false);
        }
      }
    };

    let unsubscribe;
    initializeAuth().then((unsub) => {
      unsubscribe = unsub;
    });

    // Cleanup function
    return () => {
      isMounted = false;
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [initialized]);

  // Context value
  const value = {
    // User state
    currentUser,
    loading,
    initialized,
    error,
    
    // Authentication functions
    signup,
    login,
    loginWithGoogle,
    loginWithFacebook,
    logout,
    
    // Password management
    resetPassword,
    updatePassword,
    
    // Email management
    sendEmailVerification,
    updateEmail,
    
    // Profile management
    updateProfile,
    
    // Account management
    deleteAccount,
    reauthenticate,
    
    // Utilities
    checkEmailExists,
    getUserToken,
    isAuthenticated,
    isEmailVerified,
    clearError,
    
    // User data helpers
    user: currentUser ? {
      uid: currentUser.uid,
      email: currentUser.email,
      displayName: currentUser.displayName,
      photoURL: currentUser.photoURL,
      emailVerified: currentUser.emailVerified,
      creationTime: currentUser.metadata?.creationTime,
      lastSignInTime: currentUser.metadata?.lastSignInTime
    } : null
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// HOC for protected routes
export const withAuth = (Component) => {
  return function AuthenticatedComponent(props) {
    const { currentUser, loading } = useAuth();
    
    if (loading) {
      return <div>Loading...</div>; // Replace with your loading component
    }
    
    if (!currentUser) {
      return <div>Please log in to access this page.</div>; // Replace with redirect logic
    }
    
    return <Component {...props} />;
  };
};

// Hook for protected routes
export const useRequireAuth = () => {
  const { currentUser, loading, initialized } = useAuth();
  
  useEffect(() => {
    if (initialized && !loading && !currentUser) {
      // Redirect to login page
      // window.location.href = '/login'; // Replace with your routing logic
      console.warn('User not authenticated, redirect to login');
    }
  }, [currentUser, loading, initialized]);
  
  return { currentUser, loading, initialized };
};

export default AuthContext;