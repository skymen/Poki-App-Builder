# Poki App Builder Configuration

This project uses a centralized configuration system that automatically updates your Capacitor app settings and HTML content.

## Configuration File

Edit `app.config.json` to change your app settings:

```json
{
  "previewLink": "https://dedragames.com/games/ovo3/",
  "appId": "com.dedra.ovoDimensions",
  "appName": "OvO Dimensions",
  "screenOrientations": ["landscape"],
  "server": {
    "allowNavigation": ["dedragames.com", "*.dedragames.com"]
  },
  "theme": {
    "backgroundColor": "#000000",
    "statusBarStyle": "dark"
  }
}
```

## Available Scripts

### Default Configuration (app.config.json)

- `npm run build` - Updates configuration files based on app.config.json
- `npm run build:android` - Builds for Android with updated config
- `npm run build:android:debug` - Builds debug APK for Android
- `npm run build:ios` - Builds for iOS with updated config
- `npm run cap:sync` - Syncs Capacitor with updated config

### Test Configuration (test-config.json)

- `npm run build:test` - Updates configuration files using test-config.json
- `npm run build:android:test` - Builds for Android using test configuration
- `npm run build:android:debug:test` - Builds debug APK using test configuration
- `npm run build:ios:test` - Builds for iOS using test configuration
- `npm run cap:sync:test` - Syncs Capacitor using test configuration

### Custom Configuration

You can also use any config file directly:

```bash
node update-config.js your-custom-config.json
```

## What Gets Updated

When you run the build command, the following files are automatically updated:

1. **capacitor.config.ts** - Gets values for:

   - `appId`
   - `appName`
   - `ScreenOrientation.orientation`
   - `server.allowNavigation`
   - Theme colors

2. **dist/index.html** - Gets values for:

   - Page title (appName)
   - Game iframe src (previewLink)
   - Loading text
   - Background colors

3. **Android Files**:

   - `android/app/build.gradle` - Updates `namespace` and `applicationId`
   - `android/app/src/main/res/values/strings.xml` - Updates app name and package references
   - `android/app/src/main/java/.../MainActivity.java` - Updates package name and moves to correct directory structure

4. **iOS Files**:
   - `ios/App/App/Info.plist` - Updates `CFBundleDisplayName` and `CFBundleName`
   - `ios/App/App.xcodeproj/project.pbxproj` - Updates `PRODUCT_BUNDLE_IDENTIFIER`

## Usage

### Basic Usage

1. Edit `app.config.json` with your desired settings
2. Run `npm run build:android` or `npm run build:ios`
3. Your app will be built with the updated configuration

### Using Different Configurations

1. **Test Configuration**: Use `npm run build:test` to build with `test-config.json`
2. **Custom Configuration**: Run `node update-config.js my-config.json` with any config file
3. **Multiple Apps**: Create different config files for different app variants

### Examples

```bash
# Build with default config
npm run build:android:debug

# Build with test config
npm run build:android:debug:test

# Build with custom config
node update-config.js my-game-config.json
npm run cap:sync
```

## Screen Orientations

Supported orientations:

- `"portrait"`
- `"landscape"`
- `"portrait-primary"`
- `"portrait-secondary"`
- `"landscape-primary"`
- `"landscape-secondary"`

You can specify multiple orientations in the array.
