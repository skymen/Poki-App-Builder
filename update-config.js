#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

// Get config file path from command line arguments or use default
const args = process.argv.slice(2);
const configFileName = args[0] || "app.config.json";
const configPath = path.resolve(__dirname, configFileName);

// Check if config file exists
if (!fs.existsSync(configPath)) {
  console.error(`❌ Config file not found: ${configPath}`);
  console.error(`Usage: node update-config.js [config-file-path]`);
  console.error(`Example: node update-config.js test-config.json`);
  process.exit(1);
}

console.log(`🔧 Using config file: ${path.basename(configPath)}`);
console.log("🔧 Updating app configuration...");

// Read the app configuration
const config = JSON.parse(fs.readFileSync(configPath, "utf8"));

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
    allowNavigation: ${JSON.stringify(config.server.allowNavigation, null, 6)},
    // Disable additional security restrictions
    cleartext: true,
    allowMixedContent: true,
    errorPath: '/error.html'
  },
  
  android: {
    allowMixedContent: true,
    captureInput: true,
    webContentsDebuggingEnabled: true, // Remove in production
    loggingBehavior: 'debug', // Remove in production
    // Disable security restrictions for iframe access
    webSecurity: false,
    allowUniversalAccessFromFileURLs: true,
    allowFileAccessFromFileURLs: true
  },
  
  ios: {
    contentInset: 'never',
    scrollEnabled: false,
    allowsLinkPreview: false,
    // Disable security restrictions for iframe access
    webSecurity: false,
    allowUniversalAccessFromFileURLs: true,
    allowFileAccessFromFileURLs: true
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
          
          // Try to hide footer (now directly accessible since no nested iframe)
          try {
            const iframeDoc = gameFrame.contentDocument || gameFrame.contentWindow.document;
            const footer = iframeDoc.getElementById("footer");
            if (footer) {
              footer.style.display = "none";
              console.log("Footer hidden successfully");
            } else {
              console.log("Footer element not found");
            }
          } catch (error) {
            console.log("Cannot access iframe content due to cross-origin restrictions:", error.message);
            
            // Alternative approach: send postMessage to iframe
            try {
              gameFrame.contentWindow.postMessage({
                type: "hideFooter",
                code: 'document.getElementById("footer").style.display = "none"'
              }, "*");
              console.log("Sent postMessage to hide footer");
            } catch (postError) {
              console.log("PostMessage also failed:", postError.message);
            }
          }
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

// Update Android configuration
const androidBuildGradlePath = path.join(
  __dirname,
  "android",
  "app",
  "build.gradle"
);
if (fs.existsSync(androidBuildGradlePath)) {
  console.log("🤖 Updating Android configuration...");

  let androidBuildGradle = fs.readFileSync(androidBuildGradlePath, "utf8");

  // Update namespace and applicationId
  androidBuildGradle = androidBuildGradle.replace(
    /namespace\s+"[^"]*"/g,
    `namespace "${config.appId}"`
  );
  androidBuildGradle = androidBuildGradle.replace(
    /applicationId\s+"[^"]*"/g,
    `applicationId "${config.appId}"`
  );

  fs.writeFileSync(androidBuildGradlePath, androidBuildGradle);
  console.log("✅ Updated Android build.gradle");

  // Update Android strings.xml
  const androidStringsPath = path.join(
    __dirname,
    "android",
    "app",
    "src",
    "main",
    "res",
    "values",
    "strings.xml"
  );
  if (fs.existsSync(androidStringsPath)) {
    const androidStringsTemplate = `<?xml version='1.0' encoding='utf-8'?>
<resources>
    <string name="app_name">${config.appName}</string>
    <string name="title_activity_main">${config.appName}</string>
    <string name="package_name">${config.appId}</string>
    <string name="custom_url_scheme">${config.appId}</string>
</resources>
`;
    fs.writeFileSync(androidStringsPath, androidStringsTemplate);
    console.log("✅ Updated Android strings.xml");
  }

  // Update MainActivity.java package name and handle directory structure
  const oldPackagePath = config.appId.replace(/\./g, "/");
  const mainActivityPath = path.join(
    __dirname,
    "android",
    "app",
    "src",
    "main",
    "java",
    oldPackagePath,
    "MainActivity.java"
  );

  // First, try to find MainActivity.java in any existing package structure
  const javaDir = path.join(__dirname, "android", "app", "src", "main", "java");
  let foundMainActivity = null;

  function findMainActivity(dir) {
    if (!fs.existsSync(dir)) return null;
    const items = fs.readdirSync(dir);
    for (const item of items) {
      const itemPath = path.join(dir, item);
      if (fs.statSync(itemPath).isDirectory()) {
        const result = findMainActivity(itemPath);
        if (result) return result;
      } else if (item === "MainActivity.java") {
        return itemPath;
      }
    }
    return null;
  }

  foundMainActivity = findMainActivity(javaDir);

  if (foundMainActivity) {
    // Create new directory structure
    const newPackageDir = path.join(javaDir, oldPackagePath);
    if (!fs.existsSync(newPackageDir)) {
      fs.mkdirSync(newPackageDir, { recursive: true });
    }

    // Update MainActivity.java content
    const mainActivityTemplate = `package ${config.appId};

import android.os.Bundle;
import android.webkit.WebView;
import com.getcapacitor.BridgeActivity;

public class MainActivity extends BridgeActivity {
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        
        // Disable WebView security restrictions to allow iframe access
        WebView webView = getBridge().getWebView();
        webView.getSettings().setAllowUniversalAccessFromFileURLs(true);
        webView.getSettings().setAllowFileAccessFromFileURLs(true);
        webView.getSettings().setJavaScriptCanOpenWindowsAutomatically(true);
        webView.getSettings().setDomStorageEnabled(true);
        webView.getSettings().setAllowContentAccess(true);
        webView.getSettings().setAllowFileAccess(true);
        
        // Disable web security (equivalent to --disable-web-security in Chrome)
        webView.getSettings().setMixedContentMode(android.webkit.WebSettings.MIXED_CONTENT_ALWAYS_ALLOW);
    }
}
`;

    const newMainActivityPath = path.join(newPackageDir, "MainActivity.java");
    fs.writeFileSync(newMainActivityPath, mainActivityTemplate);

    // Remove old MainActivity.java if it's in a different location
    if (foundMainActivity !== newMainActivityPath) {
      fs.unlinkSync(foundMainActivity);
      console.log(
        `✅ Moved MainActivity.java from ${foundMainActivity} to ${newMainActivityPath}`
      );

      // Clean up empty directories
      let oldDir = path.dirname(foundMainActivity);
      while (oldDir !== javaDir) {
        try {
          if (fs.readdirSync(oldDir).length === 0) {
            fs.rmdirSync(oldDir);
            oldDir = path.dirname(oldDir);
          } else {
            break;
          }
        } catch (e) {
          break;
        }
      }
    } else {
      console.log("✅ Updated MainActivity.java package name");
    }
  } else {
    console.log("⚠️  MainActivity.java not found");
  }

  // Update Android AndroidManifest.xml for orientation
  const androidManifestPath = path.join(
    __dirname,
    "android",
    "app",
    "src",
    "main",
    "AndroidManifest.xml"
  );
  if (fs.existsSync(androidManifestPath)) {
    let androidManifest = fs.readFileSync(androidManifestPath, "utf8");

    // Determine Android orientation value based on config
    let androidOrientation = "unspecified";
    if (
      config.screenOrientations.includes("landscape") &&
      !config.screenOrientations.includes("portrait")
    ) {
      androidOrientation = "landscape";
    } else if (
      config.screenOrientations.includes("portrait") &&
      !config.screenOrientations.includes("landscape")
    ) {
      androidOrientation = "portrait";
    }

    // Update MainActivity orientation
    if (androidOrientation !== "unspecified") {
      // Check if orientation is already specified
      if (androidManifest.includes("android:screenOrientation=")) {
        androidManifest = androidManifest.replace(
          /android:screenOrientation="[^"]*"/g,
          `android:screenOrientation="${androidOrientation}"`
        );
      } else {
        // Add orientation attribute to MainActivity
        androidManifest = androidManifest.replace(
          /(<activity[^>]*android:name="\.MainActivity"[^>]*)/,
          `$1\n            android:screenOrientation="${androidOrientation}"`
        );
      }
      console.log(`✅ Updated Android orientation to ${androidOrientation}`);
    }

    fs.writeFileSync(androidManifestPath, androidManifest);
  }
}

// Update iOS configuration
const iosInfoPlistPath = path.join(
  __dirname,
  "ios",
  "App",
  "App",
  "Info.plist"
);
if (fs.existsSync(iosInfoPlistPath)) {
  console.log("🍎 Updating iOS configuration...");

  let iosInfoPlist = fs.readFileSync(iosInfoPlistPath, "utf8");

  // Update CFBundleDisplayName and CFBundleName
  iosInfoPlist = iosInfoPlist.replace(
    /<key>CFBundleDisplayName<\/key>\s*<string>[^<]*<\/string>/g,
    `<key>CFBundleDisplayName</key>\n\t<string>${config.appName}</string>`
  );
  iosInfoPlist = iosInfoPlist.replace(
    /<key>CFBundleName<\/key>\s*<string>[^<]*<\/string>/g,
    `<key>CFBundleName</key>\n\t<string>${config.appName}</string>`
  );

  // Update supported interface orientations based on config
  let iosOrientations = [];
  if (config.screenOrientations.includes("landscape")) {
    iosOrientations.push("UIInterfaceOrientationLandscapeLeft");
    iosOrientations.push("UIInterfaceOrientationLandscapeRight");
  }
  if (config.screenOrientations.includes("portrait")) {
    iosOrientations.push("UIInterfaceOrientationPortrait");
    iosOrientations.push("UIInterfaceOrientationPortraitUpsideDown");
  }

  // Build orientation arrays for iPhone and iPad
  const orientationArrayiPhone = iosOrientations
    .map((o) => `\t\t<string>${o}</string>`)
    .join("\n");
  const orientationArrayiPad = iosOrientations
    .map((o) => `\t\t<string>${o}</string>`)
    .join("\n");

  // Update UISupportedInterfaceOrientations (iPhone)
  iosInfoPlist = iosInfoPlist.replace(
    /<key>UISupportedInterfaceOrientations<\/key>\s*<array>[\s\S]*?<\/array>/,
    `<key>UISupportedInterfaceOrientations</key>\n\t<array>\n${orientationArrayiPhone}\n\t</array>`
  );

  // Update UISupportedInterfaceOrientations~ipad (iPad)
  iosInfoPlist = iosInfoPlist.replace(
    /<key>UISupportedInterfaceOrientations~ipad<\/key>\s*<array>[\s\S]*?<\/array>/,
    `<key>UISupportedInterfaceOrientations~ipad</key>\n\t<array>\n${orientationArrayiPad}\n\t</array>`
  );

  fs.writeFileSync(iosInfoPlistPath, iosInfoPlist);
  console.log("✅ Updated iOS Info.plist");
}

// Update iOS project.pbxproj (bundle identifier)
const iosProjectPath = path.join(
  __dirname,
  "ios",
  "App",
  "App.xcodeproj",
  "project.pbxproj"
);
if (fs.existsSync(iosProjectPath)) {
  let iosProject = fs.readFileSync(iosProjectPath, "utf8");

  // Update PRODUCT_BUNDLE_IDENTIFIER
  iosProject = iosProject.replace(
    /PRODUCT_BUNDLE_IDENTIFIER = [^;]*/g,
    `PRODUCT_BUNDLE_IDENTIFIER = ${config.appId}`
  );

  // Set code signing to manual for development (no team required)
  iosProject = iosProject.replace(
    /CODE_SIGN_STYLE = Automatic;/g,
    "CODE_SIGN_STYLE = Manual;"
  );

  // Set code sign identity to not sign for simulator builds
  iosProject = iosProject.replace(
    /CODE_SIGN_IDENTITY = "iPhone Developer";/g,
    'CODE_SIGN_IDENTITY = "";'
  );

  fs.writeFileSync(iosProjectPath, iosProject);
  console.log("✅ Updated iOS bundle identifier and signing configuration");
}

console.log("🎉 Configuration update complete!");
console.log(`📱 App: ${config.appName} (${config.appId})`);
console.log(`🔗 Preview: ${config.previewLink}`);
console.log(`📱 Orientation: ${config.screenOrientations.join(", ")}`);
