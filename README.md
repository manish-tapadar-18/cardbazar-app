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

---

## Play History Screen — `src/pages/PostAuth/PlayHistory/PlayHistory.tsx`

### Purpose

The Play History screen lets an authenticated user browse their past game plays. Records are filtered by **game category** (horizontal tab bar) and an optional **date** (calendar modal), loaded in pages of 14, and displayed as date-grouped cards. The screen also silently validates the session and refreshes admin config on every focus.

---

### State Architecture

| State | Type | Role |
|---|---|---|
| `categories` | `IGameCategoryResponse[]` | All game categories fetched from backend |
| `activeCategory` | `string` | ID of the currently selected tab |
| `history` | `IPlayHistoryItem[]` | Flat list of play records accumulated across pages |
| `total` | `number` | Total record count from backend — used to stop pagination |
| `pageNum` | `number` | Current zero-based page index |
| `selectedDate` | `string` | Date chosen in the picker, shown in the filter bar (`YYYY-MM-DD`) |
| `isCatLoading` | `boolean` | Hides tab bar while categories are loading |
| `isLoading` | `boolean` | Shows skeleton on first page load |
| `isRefreshing` | `boolean` | Drives `FlatList` pull-to-refresh spinner |
| `showDatePicker` | `boolean` | Controls `DatePickerModal` visibility |

Two refs (`activeCatRef`, `activeDateRef`) mirror the active category and date. They exist to prevent **stale closure** bugs: async callbacks (`fetchHistory`, `onEndReached`) capture refs, not state, so they always read the latest values even after React batches re-renders.

`isFetchingMore` ref acts as a mutex to prevent duplicate pagination calls when the user scrolls quickly.

---

### Business Logic

#### 1. Session Validation (on every focus)

`fetchUserDetails` runs on every `useFocusEffect` cycle. It re-fetches the user profile using the stored email. If the backend returns `STATUS = 'INACTIVE'`, `clearAllStores()` is called immediately, which triggers a logout by wiping all Zustand stores.

#### 2. Category Load & Auto-select (on every focus)

`fetchCategories` fetches the full list of game categories. On success it:
- Stores the list in `categories` state.
- Auto-selects the **first category** (`data[0].ID`).
- Writes that ID into both `activeCategory` state and `activeCatRef`.
- Immediately calls `fetchHistory` for that category and whatever date is in `activeDateRef` (preserving an active date filter across focus cycles).

While categories are loading, the tab bar is hidden entirely (`isCatLoading`).

#### 3. History Fetch (`fetchHistory`)

`fetchHistory(categoryId, date, page, append)` is the single source of truth for loading records.

The API payload (`buildPayload`) sends four search filters:
- `USER_GAME_PLAY.USER_ID = userId` — scopes to the logged-in user.
- `USER_GAME_PLAY.RESULT_PUBLISH = ''` — only published results (empty-string equals filter means "published").
- `USER_GAME_PLAY.DATE = date` — optional date filter; empty string means all dates.
- `GAME_CATEGORY.ID = categoryId` — scopes to the selected category.

Pagination is offset-based: `offset = PER_PAGE * page`, `limit = PER_PAGE` (14 records).

When `append = true` the new records are merged with existing history (`[...prev, ...data.DATA]`); when `false` the list is replaced. The skeleton is only shown for `page === 0` loads.

#### 4. Category Tab Switch

Pressing a tab calls `onTabPress`. If the same tab is already active the call is a no-op. Otherwise:
- Updates `activeCategory` state and `activeCatRef`.
- Resets `pageNum` to 0 and clears `history`.
- Scrolls `FlatList` back to the top.
- Fetches history for the new category, keeping the current date filter from `activeDateRef`.

#### 5. Date Filter

The filter bar shows a clock icon with the label **FILTER DATE**. Tapping it opens `DatePickerModal`.

When the user confirms a date (`onDateConfirmed`):
- Closes the modal.
- Stores the selected date in `selectedDate` state and `activeDateRef`.
- Resets to page 0, clears history, scrolls to top.
- Fetches history for the current category with the new date.

The **✕ clear button** (`onClearDate`) does the same but sets the date back to an empty string, which the API interprets as "no date filter".

The clear button is visually disabled (opacity 0.3) when no date is selected.

#### 6. Date Grouping (`groupedHistory`)

The flat `history` array is transformed into `DateGroup[]` via `useMemo`. A `Map<string, DateGroup>` is built in a single pass:
- Key: `YYYY-MM-DD` (UTC-normalised via `moment.utc().format`).
- Value: display label `DD-MM-YYYY` plus an array of items for that date.

The `Map` preserves insertion order, so groups appear chronologically as returned by the API (newest first, since the server sorts by `CREATED_AT DESC`). This grouping re-runs automatically whenever pagination appends new records to `history`.

#### 7. Pagination (Infinite Scroll)

`onEndReached` fires when the user scrolls within 30% of the list bottom (`onEndReachedThreshold={0.3}`). It is guarded by:
- `distanceFromEnd >= 0` — avoids a known React Native false-positive on mount.
- `history.length > 0` — no trigger on empty list.
- `!isLoading && !isFetchingMore.current` — prevents concurrent fetches.
- `history.length < total` — stops when all records are loaded.

On a valid trigger, `pageNum` increments and `fetchHistory` is called with `append = true`.

#### 8. Pull-to-Refresh

`onRefresh` sets `isRefreshing = true` and re-fetches from page 0 with `append = false`, replacing the list. `isRefreshing` is reset to `false` inside the `finally` block of `fetchHistory`.

---

### Component Reference

#### `DatePickerModal`

**File:** `src/components/DatePickerModal.tsx`

A reusable calendar modal for selecting a single past date.

| Detail | Value |
|---|---|
| Props | `visible: boolean`, `onConfirm: (date: string) => void`, `onClose: () => void` |
| Returns | `YYYY-MM-DD` string via `onConfirm` |
| Max selectable date | Today (`TODAY` constant, computed once at module load) |

**Internal state:**

| State | Role |
|---|---|
| `selectedDate` | The day the user tapped; empty string if nothing chosen |
| `currentMonth` | The `YYYY-MM-DD` string whose year-month is currently displayed; starts at today |

**Month navigation logic:**

The calendar header is fully custom (`renderHeader`). Default library arrows are hidden (`hideArrows`). The `‹` / `›` arrows call `prevMonth` / `nextMonth`:

- `prevMonth`: pure integer arithmetic — decrements `month` by 1, wraps December→January and decrements year. Sets `currentMonth` as `YYYY-MM-01`. No `Date` object or `toISOString` is used, which avoids UTC timezone offset shifting the date across a month boundary.
- `nextMonth`: only navigates forward if the target year-month is strictly before today's year-month. The forward arrow is disabled (`isNextDisabled`) when the displayed month equals today's month.

The calendar is re-mounted when the month changes (`key={currentMonth.substring(0, 7)}`), ensuring `react-native-calendars` always renders the correct month grid.

**Confirmation flow:**
- Tapping a day sets `selectedDate`. The selected row below the calendar shows the chosen date.
- **Confirm** button (gold gradient) calls `onConfirm(selectedDate)` and resets `selectedDate` to `''`.
- **Cancel** button (red background) calls `onClose()` and resets `selectedDate` to `''`.
- Tapping the overlay backdrop also closes and resets.
- Confirm is disabled (greyed out, 50% opacity) until a day is selected.

---

#### `PlayHistoryCard`

**File:** `src/components/PlayHistoryCard.tsx`

A pure presentational component. Renders all play records that share a single date as one visual card.

| Detail | Value |
|---|---|
| Props | `date: string` (DD-MM-YYYY display label), `items: IPlayHistoryItem[]` |
| No internal state | Stateless functional component |

**Layout structure:**

```
┌─ [date badge] ─────────────────────────────────┐   ← gold gradient, floated above card (zIndex 99999)
│                                                 │
│  [card body — dark purple gradient]             │
│  ┌─ row ─────────────────────────────────────┐ │
│  │  [schedule name — gold gradient text]     │ │
│  │  [card image] [card name in uppercase]    │ │
│  └───────────────────────────────────────────┘ │
│  ─────────────────── divider ─────────────────  │   ← only between rows, not after last
│  ┌─ row ─────────────────────────────────────┐ │
│  │  ...                                      │ │
│  └───────────────────────────────────────────┘ │
└─────────────────────────────────────────────────┘
```

- **Date badge**: absolutely positioned (`top: -rh(2)`) so it overlaps the card top edge, styled as a gold-to-amber gradient pill.
- **Schedule name**: rendered via `GradientText` with the project-wide `GOLD` gradient at `180°` angle.
- **Card image**: loaded from `ENV.BASE_URL + item.CARD_IMAGE_URL` with a local fallback (`Images.SMALL_CARD`) for broken URLs.
- **Card name**: displayed in uppercase with a `numberOfLines={1}` clamp.
- **Divider**: a 1px white line rendered between items using `index < items.length - 1` guard.

Each item is keyed by `item.ID` so React can reconcile efficiently during pagination appends.

---

# Learn More

To learn more about React Native, take a look at the following resources:

- [React Native Website](https://reactnative.dev) - learn more about React Native.
- [Getting Started](https://reactnative.dev/docs/environment-setup) - an **overview** of React Native and how setup your environment.
- [Learn the Basics](https://reactnative.dev/docs/getting-started) - a **guided tour** of the React Native **basics**.
- [Blog](https://reactnative.dev/blog) - read the latest official React Native **Blog** posts.
- [`@facebook/react-native`](https://github.com/facebook/react-native) - the Open Source; GitHub **repository** for React Native.
