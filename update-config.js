#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

// Read the app configuration
const configPath = path.join(__dirname, "app.config.json");
const config = JSON.parse(fs.readFileSync(configPath, "utf8"));

console.log("🔧 Updating app configuration...");

// Update capacitor.config.ts
const capacitorConfigPath = path.join(__dirname, "capacitor.config.ts");
const capacitorTemplate = `// capacitor.config.ts
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: '${config.appId}',
  appName: '${config.appName}',
  webDir: 'dist', // or wherever your built files are
  
  // Essential for game performance
  server: {
    androidScheme: 'https',
    iosScheme: 'capacitor',
    allowNavigation: ${JSON.stringify(config.server.allowNavigation, null, 6)}
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
      orientation: ${JSON.stringify(config.screenOrientations)}
    },
    
    // For better performance
    CapacitorHttp: {
      enabled: true
    },
    
    // Status bar configuration
    StatusBar: {
      style: '${config.theme.statusBarStyle}',
      backgroundColor: '${config.theme.backgroundColor}',
      overlay: false
    },
    
    // Hide splash screen quickly for games
    SplashScreen: {
      launchShowDuration: 1000,
      backgroundColor: '${config.theme.backgroundColor}',
      showSpinner: false
    }
  }
};

export default config;
`;

fs.writeFileSync(capacitorConfigPath, capacitorTemplate);
console.log("✅ Updated capacitor.config.ts");

// Update index.html
const indexPath = path.join(__dirname, "dist", "index.html");
const indexTemplate = `<!-- index.html - Your main wrapper page -->
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta
      name="viewport"
      content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no"
    />
    <title>${config.appName}</title>
    <style>
      * {
        margin: 0;
        padding: 0;
        box-sizing: border-box;
      }

      body {
        background: ${config.theme.backgroundColor};
        overflow: hidden;
        font-family: Arial, sans-serif;
      }

      #game-container {
        width: 100vw;
        height: 100vh;
        position: relative;
      }

      #game-frame {
        width: 100%;
        height: 100%;
        border: none;
        background: ${config.theme.backgroundColor};
      }

      #loading {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        color: white;
        z-index: 10;
        display: flex;
        flex-direction: column;
        align-items: center;
      }

      .spinner {
        border: 4px solid #333;
        border-top: 4px solid #fff;
        border-radius: 50%;
        width: 40px;
        height: 40px;
        animation: spin 1s linear infinite;
        margin-bottom: 20px;
      }

      @keyframes spin {
        0% {
          transform: rotate(0deg);
        }
        100% {
          transform: rotate(360deg);
        }
      }
    </style>
  </head>
  <body>
    <div id="game-container">
      <div id="loading">
        <div class="spinner"></div>
        <p>Loading ${config.appName}...</p>
      </div>
      <iframe
        id="game-frame"
        src="${config.previewLink}"
        allow="accelerometer; gyroscope; gamepad; fullscreen; autoplay; encrypted-media"
        allowfullscreen
        style="display: none"
      >
      </iframe>
    </div>

    <script>
      document.addEventListener("DOMContentLoaded", function () {
        const gameFrame = document.getElementById("game-frame");
        const loading = document.getElementById("loading");

        // Show game when loaded
        gameFrame.addEventListener("load", function () {
          loading.style.display = "none";
          gameFrame.style.display = "block";
        });

        // Handle frame errors
        gameFrame.addEventListener("error", function () {
          loading.innerHTML =
            "<p>Game failed to load. Check your connection.</p>";
        });

        // Prevent context menu on long press (mobile)
        document.addEventListener("contextmenu", function (e) {
          e.preventDefault();
        });

        // Prevent zoom gestures
        document.addEventListener(
          "touchmove",
          function (e) {
            if (e.scale !== 1) {
              e.preventDefault();
            }
          },
          { passive: false }
        );

        // Handle device back button (Android)
        document.addEventListener("backbutton", function (e) {
          e.preventDefault();
          // Optionally implement custom back behavior
        });
      });
    </script>
  </body>
</html>
`;

// Ensure dist directory exists
const distDir = path.join(__dirname, "dist");
if (!fs.existsSync(distDir)) {
  fs.mkdirSync(distDir, { recursive: true });
}

fs.writeFileSync(indexPath, indexTemplate);
console.log("✅ Updated dist/index.html");

console.log("🎉 Configuration update complete!");
console.log(`📱 App: ${config.appName} (${config.appId})`);
console.log(`🔗 Preview: ${config.previewLink}`);
console.log(`📱 Orientation: ${config.screenOrientations.join(", ")}`);
