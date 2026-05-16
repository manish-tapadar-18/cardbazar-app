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

---

## Home Screen — `src/pages/PostAuth/Home/Home.tsx`

### Purpose

The `Home` screen is the primary landing page after authentication. It displays all available game categories in a scrollable list, syncs the user's device and wallet state on every focus, and enforces device-level access control via modals.

---

### Business Logic

#### 1. Profile & FCM Token Sync (on mount)

`getProfileDetails` runs once when the screen mounts via `useEffect`. It:

- Fetches the full user profile from the backend using the stored email.
- Sets Crashlytics attributes (`user ID`, `email`).
- Compares the locally retrieved FCM token against the token stored on the server. If they differ, `updateFCMTokenAPI` is called to push the new token.
- Calls `checkDeviceId` with the resolved user ID.

#### 2. Device Access Control (`checkDeviceId`)

Runs immediately after `getProfileDetails` resolves. It:

- Retrieves the device's unique hardware ID (`react-native-device-info`).
- Queries the backend (`Repository.User.GetDeviceDetails`) to see if this device is already registered for the user.
- **Device found & `STATUS = 1`** → normal flow, `DeviceBlockModal` is closed.
- **Device found & `STATUS ≠ 1`** → device is blocked; `DeviceBlockModal` is shown.
- **Device not found** → registers the device with full hardware metadata via `Repository.User.UpdateDevice`. On success `MultiLoginModal` is closed; on failure it is shown (indicating the account is active on another device).

#### 3. Wallet Balance (on every screen focus)

`fetchWalletBalance` is called via `useFocusEffect` every time the screen comes into focus. It fetches the user's wallet balance and writes it to the `walletStore`.

#### 4. Admin Details (on every screen focus)

`fetchAdminDetails` is also called via `useFocusEffect`. It fetches global admin configuration (e.g., support phone number) and writes it to `adminDetailsStore`. This data is consumed by `MultiLoginModal`.

#### 5. Game Categories (on every screen focus)

`fetchAllGameCategories` is called via `useFocusEffect`. It fetches the list of game categories from `Repository.Game.getAllGameCategories` and stores them in local state. While loading with an empty list, a skeleton UI is rendered. Pull-to-refresh invokes the same function.

#### 6. Navigation

`navigateToGameDetails(id)` navigates to the `GameDetails` screen, passing the selected `categoryId` as a route param.

---

### Component Reference

The following components are defined in or directly imported by `Home.tsx`. Each entry notes where the component lives so other screens can reuse it.

---

#### `ListHeader`

**File:** inline in `src/pages/PostAuth/Home/Home.tsx`

A stateless header rendered above the game category list.

| Detail | Value |
|--------|-------|
| Renders | `"ALL GAMES"` label in a styled view |
| Used by | `SkeletonList`, `FlatList.ListHeaderComponent` |

---

#### `SkeletonList`

**File:** inline in `src/pages/PostAuth/Home/Home.tsx`

Renders `ListHeader` followed by 4 `CardSkeleton` placeholders. Shown only when `isLoading === true` and `gameCategories` is empty (first load).

| Detail | Value |
|--------|-------|
| Skeleton count | `SKELETON_COUNT = 4` |
| Depends on | `ListHeader`, `CardSkeleton` |

---

#### `CardSkeleton`

**File:** `src/pages/PostAuth/Home/components/CardSkeleton.tsx`

A placeholder card that mirrors the visual structure of `CategoryCard`. Composed of `SkeletonBox` elements that pulse during loading.

| Detail | Value |
|--------|-------|
| Props | none |
| Depends on | `SkeletonBox` |
| Reusable | Yes — import from the path above for any list that needs card-shaped skeletons |

```tsx
import CardSkeleton from 'src/pages/PostAuth/Home/components/CardSkeleton';
```

---

#### `SkeletonBox`

**File:** `src/pages/PostAuth/Home/components/SkeletonBox.tsx`

A generic animated placeholder block. Uses `Animated.timing` in a loop to pulse opacity between `0.4` and `1.0` (700 ms each way, native driver).

| Detail | Value |
|--------|-------|
| Props | `style: any` — forwarded to `Animated.View` |
| Animation | Opacity pulse loop, starts on mount, stops on unmount |
| Reusable | Yes — pass any `StyleSheet` shape as `style` |

```tsx
import SkeletonBox from 'src/pages/PostAuth/Home/components/SkeletonBox';

<SkeletonBox style={{ width: '80%', height: 16, borderRadius: 4, backgroundColor: '#333' }} />
```

---

#### `CategoryCard`

**File:** `src/pages/PostAuth/Home/components/CategoryCard.tsx`

Renders a single game category as a tappable gradient card.

| Detail | Value |
|--------|-------|
| Props | `item: IGameCategoryResponse`, `onPress: (id: string) => void`, `contestCount?: number` |
| Layout | Dark-purple gradient card with gold category name (`GradientText`), description (2-line clamp), a yellow badge for contest count, and a "LET'S PLAY" button |
| Navigation trigger | `onPress(item.ID)` — caller decides the destination |
| Reusable | Yes — works with any `IGameCategoryResponse` data |

```tsx
import CategoryCard from 'src/pages/PostAuth/Home/components/CategoryCard';

<CategoryCard
  item={gameCategoryItem}
  onPress={(id) => navigation.navigate('GameDetails', { categoryId: id })}
  contestCount={10}
/>
```

---

#### `GradientIconBar`

**File:** `src/components/GradientIconBar.tsx`

A horizontal top-navigation bar wrapped in a gradient header. Reads the active route name to highlight the correct tab.

| Detail | Value |
|--------|-------|
| Props | none |
| Items | Games List, Game Rules, Refer & Earn, Switch Language |
| Active tab detection | Derived from `useRoute().name` via `ROUTE_ACTIVE_KEY` map |
| Navigation | Uses `navigation.navigate` to `MainTabs > HomeTab > {Screen}` |
| Language switch | Opens the language modal via `useLanguageModalStore` |
| Reusable | Yes — can be dropped into any screen that is part of `HomeTab` stack |

```tsx
import GradientIconBar from 'src/components/GradientIconBar';

<GradientIconBar />
```

---

#### `DeviceBlockModal`

**File:** `src/components/DeviceBlockModal.tsx`

A full-screen modal shown when the user's device has been blocked by an admin. Visibility is driven by `useDeviceModalStore.isDeviceBlockVisible`.

| Detail | Value |
|--------|-------|
| Props | `onCheckDevice: (userId: string) => void` |
| Behaviour | "Refresh" button re-fetches the user profile and calls `onCheckDevice` to re-run device status check |
| Dismissable | No — `onRequestClose` is a no-op; only clears when device status becomes active |
| Store | `useDeviceModalStore` — `isDeviceBlockVisible`, `openDeviceBlock`, `closeDeviceBlock` |
| Reusable | Yes — pass the same `checkDeviceId` function from any screen that needs device-gate enforcement |

```tsx
import DeviceBlockModal from 'src/components/DeviceBlockModal';

<DeviceBlockModal onCheckDevice={(userId) => checkDeviceId(userId)} />
```

---

#### `MultiLoginModal`

**File:** `src/components/MultiLoginModal.tsx`

A full-screen modal shown when the backend detects the account is already active on another device. Visibility is driven by `useDeviceModalStore.isMultiLoginVisible`.

| Detail | Value |
|--------|-------|
| Props | none |
| Actions | **Support** — dials `adminDetails.DEVICE_SUPPORT_NUMBER` or `adminDetails.MOBILE` via `Linking`; **Logout** — clears all stores and sets auth status to `false` |
| Dismissable | No — user must call support or log out |
| Stores consumed | `useDeviceModalStore`, `useAdminDetailsStore`, `useSwitchStackStore` |
| Reusable | Yes — drop it anywhere in the post-auth tree; it self-manages visibility via the store |

```tsx
import MultiLoginModal from 'src/components/MultiLoginModal';

<MultiLoginModal />
```

---

# Learn More

To learn more about React Native, take a look at the following resources:

- [React Native Website](https://reactnative.dev) - learn more about React Native.
- [Getting Started](https://reactnative.dev/docs/environment-setup) - an **overview** of React Native and how setup your environment.
- [Learn the Basics](https://reactnative.dev/docs/getting-started) - a **guided tour** of the React Native **basics**.
- [Blog](https://reactnative.dev/blog) - read the latest official React Native **Blog** posts.
- [`@facebook/react-native`](https://github.com/facebook/react-native) - the Open Source; GitHub **repository** for React Native.
