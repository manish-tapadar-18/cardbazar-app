This is a new [**React Native**](https://reactnative.dev) project, bootstrapped using [`@react-native-community/cli`](https://github.com/react-native-community/cli).

# Getting Started

> **Note**: Make sure you have completed the [Set Up Your Environment](https://reactnative.dev/docs/set-up-your-environment) guide before proceeding.

## Step 1: Start Metro

First, you will need to run **Metro**, the JavaScript build tool for React Native.

To start the Metro dev server, run the following command from the root of your React Native project:

```sh
# Using npm
npm start

# OR using Yarn
yarn start
```

## Step 2: Build and run your app

With Metro running, open a new terminal window/pane from the root of your React Native project, and use one of the following commands to build and run your Android or iOS app:

### Android

```sh
# Using npm
npm run android

# OR using Yarn
yarn android
```

### iOS

For iOS, remember to install CocoaPods dependencies (this only needs to be run on first clone or after updating native deps).

The first time you create a new project, run the Ruby bundler to install CocoaPods itself:

```sh
bundle install
```

Then, and every time you update your native dependencies, run:

```sh
bundle exec pod install
```

For more information, please visit [CocoaPods Getting Started guide](https://guides.cocoapods.org/using/getting-started.html).

```sh
# Using npm
npm run ios

# OR using Yarn
yarn ios
```

If everything is set up correctly, you should see your new app running in the Android Emulator, iOS Simulator, or your connected device.

This is one way to run your app — you can also build it directly from Android Studio or Xcode.

## Step 3: Modify your app

Now that you have successfully run the app, let's make changes!

Open `App.tsx` in your text editor of choice and make some changes. When you save, your app will automatically update and reflect these changes — this is powered by [Fast Refresh](https://reactnative.dev/docs/fast-refresh).

When you want to forcefully reload, for example to reset the state of your app, you can perform a full reload:

- **Android**: Press the <kbd>R</kbd> key twice or select **"Reload"** from the **Dev Menu**, accessed via <kbd>Ctrl</kbd> + <kbd>M</kbd> (Windows/Linux) or <kbd>Cmd ⌘</kbd> + <kbd>M</kbd> (macOS).
- **iOS**: Press <kbd>R</kbd> in iOS Simulator.

## Congratulations! :tada:

You've successfully run and modified your React Native App. :partying_face:

### Now what?

- If you want to add this new React Native code to an existing application, check out the [Integration guide](https://reactnative.dev/docs/integration-with-existing-apps).
- If you're curious to learn more about React Native, check out the [docs](https://reactnative.dev/docs/getting-started).

# Troubleshooting

If you're having issues getting the above steps to work, see the [Troubleshooting](https://reactnative.dev/docs/troubleshooting) page.

---

## Fix: Android Studio Sync Fails with react-native-reanimated CMake Error

### Environment

- React Native: `0.85.0`
- `react-native-reanimated`: `^4.3.0`
- `react-native-worklets`: `^0.8.1`
- OS: Windows 11
- `buildToolsVersion`: `36.0.0`
- `compileSdkVersion`: `36`
- `targetSdkVersion`: `36`
- `ndkVersion`: `27.1.12297006`
- `kotlinVersion`: `2.1.20`
- CMake: `3.22.1`

### Error

Android Studio sync failed with:

```
Caused by: com.android.ide.common.process.ProcessException: Error while executing process
cmake.exe with arguments { -DANDROID_ABI=x86 ... -H.../react-native-reanimated/android ... }
```

### Root Cause

`react-native-reanimated` 4.x uses `find_package(react-native-worklets REQUIRED CONFIG)` in its `CMakeLists.txt`. It depends on a **prefab** (prebuilt native library) from `react-native-worklets` being present before its own CMake configuration runs.

During Android Studio sync, CMake is invoked for **all ABIs including x86 (32-bit)**. At that point the worklets prefab has not been built yet for x86, so CMake cannot find the package and the sync fails.

`gradle clean` appeared successful because it only deletes build artifacts — it does not compile any native code.

### Fix Applied

**1. Add `abiFilters` to `android/app/build.gradle`**

Inside the `defaultConfig` block, add:

```groovy
ndk {
    abiFilters "arm64-v8a", "x86_64"
}
```

This tells the Android Gradle Plugin to only build native code for `arm64-v8a` (physical devices) and `x86_64` (modern emulators), dropping x86 32-bit which was the failing ABI.

**2. Build native libraries from CLI before syncing in Android Studio**

Run the following from the `android/` directory to build the worklets prefab first, then reanimated:

```powershell
cd android
./gradlew :react-native-worklets:externalNativeBuildDebug
./gradlew :react-native-reanimated:externalNativeBuildDebug
```

After both complete successfully, go to Android Studio and do:

**File → Sync Project with Gradle Files**

The sync will now succeed because the worklets prefab is already in place when reanimated's CMake configuration runs.

# Learn More

To learn more about React Native, take a look at the following resources:

- [React Native Website](https://reactnative.dev) - learn more about React Native.
- [Getting Started](https://reactnative.dev/docs/environment-setup) - an **overview** of React Native and how setup your environment.
- [Learn the Basics](https://reactnative.dev/docs/getting-started) - a **guided tour** of the React Native **basics**.
- [Blog](https://reactnative.dev/blog) - read the latest official React Native **Blog** posts.
- [`@facebook/react-native`](https://github.com/facebook/react-native) - the Open Source; GitHub **repository** for React Native.
