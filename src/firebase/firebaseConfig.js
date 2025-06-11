import { initializeApp } from 'firebase/app';
import { getAuth, connectAuthEmulator } from 'firebase/auth';
import { getFirestore, connectFirestoreEmulator } from 'firebase/firestore';
import { getStorage, connectStorageEmulator } from 'firebase/storage';
import { getAnalytics, isSupported } from 'firebase/analytics';
import { getFunctions, connectFunctionsEmulator } from 'firebase/functions';

// Validate required environment variables
const requiredEnvVars = [
  'REACT_APP_FIREBASE_API_KEY',
  'REACT_APP_FIREBASE_AUTH_DOMAIN',
  'REACT_APP_FIREBASE_PROJECT_ID',
  'REACT_APP_FIREBASE_STORAGE_BUCKET',
  'REACT_APP_FIREBASE_MESSAGING_SENDER_ID',
  'REACT_APP_FIREBASE_APP_ID'
];

const missingVars = requiredEnvVars.filter(
  varName => !process.env[varName]
);

if (missingVars.length > 0) {
  throw new Error(
    `Missing required Firebase environment variables: ${missingVars.join(', ')}\n` +
    'Please check your .env file and ensure all Firebase configuration variables are set.'
  );
}

// Firebase configuration object
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID,
  // Optional: Add measurement ID for Analytics if you have it
  ...(process.env.REACT_APP_FIREBASE_MEASUREMENT_ID && {
    measurementId: process.env.REACT_APP_FIREBASE_MEASUREMENT_ID
  })
};

// Development mode logging (only in development)
if (process.env.NODE_ENV === 'development') {
  console.log('🔥 Firebase Configuration Status:');
  Object.entries(firebaseConfig).forEach(([key, value]) => {
    console.log(`  ${key}: ${value ? '✅ Set' : '❌ Missing'}`);
  });
  console.log(`  Environment: ${process.env.NODE_ENV}`);
}

// Initialize Firebase app
let app;
try {
  app = initializeApp(firebaseConfig);
  console.log('✅ Firebase app initialized successfully');
} catch (error) {
  console.error('❌ Failed to initialize Firebase:', error);
  throw new Error(`Firebase initialization failed: ${error.message}`);
}

// Initialize Firebase services
let auth, db, storage, analytics, functions;

try {
  // Initialize Authentication
  auth = getAuth(app);
  console.log('✅ Firebase Auth initialized');

  // Initialize Firestore
  db = getFirestore(app);
  console.log('✅ Firestore initialized');

  // Initialize Storage
  storage = getStorage(app);
  console.log('✅ Firebase Storage initialized');

  // Initialize Functions
  functions = getFunctions(app);
  console.log('✅ Firebase Functions initialized');

  // Initialize Analytics (only if supported and measurement ID is provided)
  if (process.env.REACT_APP_FIREBASE_MEASUREMENT_ID) {
    isSupported().then((supported) => {
      if (supported) {
        analytics = getAnalytics(app);
        console.log('✅ Firebase Analytics initialized');
      } else {
        console.log('⚠️ Firebase Analytics not supported in this environment');
      }
    });
  }

} catch (error) {
  console.error('❌ Failed to initialize Firebase services:', error);
  throw new Error(`Firebase services initialization failed: ${error.message}`);
}

// Connect to Firebase Emulators in development
if (process.env.NODE_ENV === 'development' && process.env.REACT_APP_USE_FIREBASE_EMULATOR === 'true') {
  try {
    // Auth Emulator
    if (!auth._delegate._config.emulator) {
      connectAuthEmulator(auth, 'http://localhost:9099', { disableWarnings: true });
      console.log('🔧 Connected to Auth Emulator');
    }

    // Firestore Emulator
    if (!db._delegate._settings?.host?.includes('localhost')) {
      connectFirestoreEmulator(db, 'localhost', 8080);
      console.log('🔧 Connected to Firestore Emulator');
    }

    // Storage Emulator
    if (!storage._delegate._host?.includes('localhost')) {
      connectStorageEmulator(storage, 'localhost', 9199);
      console.log('🔧 Connected to Storage Emulator');
    }

    // Functions Emulator
    if (!functions._delegate._url?.includes('localhost')) {
      connectFunctionsEmulator(functions, 'localhost', 5001);
      console.log('🔧 Connected to Functions Emulator');
    }

  } catch (emulatorError) {
    console.warn('⚠️ Failed to connect to Firebase Emulators:', emulatorError.message);
    console.warn('This is normal if emulators are not running');
  }
}

// Configuration validation helper
export const validateFirebaseConfig = () => {
  const configStatus = {
    isValid: true,
    missing: [],
    present: []
  };

  Object.entries(firebaseConfig).forEach(([key, value]) => {
    if (value) {
      configStatus.present.push(key);
    } else {
      configStatus.missing.push(key);
      configStatus.isValid = false;
    }
  });

  return configStatus;
};

// Service availability checker
export const checkServiceAvailability = async () => {
  const services = {
    auth: false,
    firestore: false,
    storage: false,
    analytics: false,
    functions: false
  };

  try {
    // Check Auth
    if (auth) {
      await auth.authStateReady();
      services.auth = true;
    }

    // Check Firestore
    if (db) {
      services.firestore = true;
    }

    // Check Storage
    if (storage) {
      services.storage = true;
    }

    // Check Analytics
    if (analytics) {
      services.analytics = true;
    }

    // Check Functions
    if (functions) {
      services.functions = true;
    }

  } catch (error) {
    console.warn('Service availability check failed:', error);
  }

  return services;
};

// Environment-specific configuration
export const firebaseEnv = {
  isDevelopment: process.env.NODE_ENV === 'development',
  isProduction: process.env.NODE_ENV === 'production',
  useEmulator: process.env.REACT_APP_USE_FIREBASE_EMULATOR === 'true',
  projectId: firebaseConfig.projectId,
  region: process.env.REACT_APP_FIREBASE_REGION || 'us-central1'
};

// Export Firebase services
export { auth, db, storage, analytics, functions };

// Export the app instance
export default app;

// Log successful initialization in development
if (process.env.NODE_ENV === 'development') {
  console.log('🎉 Firebase configuration completed successfully!');
  console.log('📊 Available services:', {
    auth: !!auth,
    firestore: !!db,
    storage: !!storage,
    analytics: !!analytics,
    functions: !!functions
  });
}