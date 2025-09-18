// capacitor.config.ts
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.dedra.ovoDimensions',
  appName: 'OvO Dimensions',
  webDir: 'dist', // or wherever your built files are
  
  // Essential for game performance
  server: {
    androidScheme: 'https',
    iosScheme: 'capacitor',
    allowNavigation: [
      "dedragames.com",
      "*.dedragames.com"
]
  },
  
  android: {
    allowMixedContent: true,
    captureInput: true,
    webContentsDebuggingEnabled: true, // Remove in production
    loggingBehavior: 'debug' // Remove in production
  },
  
  ios: {
    contentInset: 'never',
    scrollEnabled: false,
    allowsLinkPreview: false
  },
  
  plugins: {
    // Essential for web games
    CapacitorCookies: {
      enabled: true
    },
    
    // Prevent app from sleeping during gameplay
    KeepAwake: {
      enabled: true
    },
    
    // Handle device orientation
    ScreenOrientation: {
      orientation: ["landscape"]
    },
    
    // For better performance
    CapacitorHttp: {
      enabled: true
    },
    
    // Status bar configuration
    StatusBar: {
      style: 'dark',
      backgroundColor: '#000000',
      overlay: false
    },
    
    // Hide splash screen quickly for games
    SplashScreen: {
      launchShowDuration: 1000,
      backgroundColor: '#000000',
      showSpinner: false
    }
  }
};

export default config;
