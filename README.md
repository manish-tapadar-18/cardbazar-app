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

---

## Result Screen — `src/pages/PostAuth/Result/Result.tsx`

### Purpose

The Result screen lets authenticated users browse **published game draw results**, filtered by **game category** (horizontal tab bar). Results are loaded in pages of 10, grouped visually by draw date, and presented as gold-badged cards. The screen also silently validates the user session and refreshes admin config on every navigation focus.

---

### Data Flow Overview

```
useFocusEffect
  ├─ fetchUserDetails()      → session guard (logout if INACTIVE)
  ├─ fetchCategories()       → loads tabs → auto-selects first → fetchResults(firstId, page 0)
  └─ fetchAdminDetails()     → syncs admin config to adminDetailsStore

onTabPress(tab)              → fetchResults(tab.ID, page 0)   [replace list]
onRefresh()                  → fetchResults(activeRef,  page 0)   [replace list]
onEndReached()               → fetchResults(activeRef,  pageNum+1) [append list]
```

---

### Type Definitions

```ts
// A single schedule record enriched with its parent game's date and name
type FlatResultItem = IResultScheduleDetail & {
  GAME_DATE: string;   // "YYYY-MM-DD" from GAME_MASTER
  GAME_NAME: string;   // display name of the parent game
};

// One visual card = one date with N schedule rows
type DateGroup = {
  GAME_DATE: string;         // "YYYY-MM-DD" — used as FlatList key
  items: FlatResultItem[];   // all schedules for that date
};
```

---

### State Architecture

| State | Type | Role |
|---|---|---|
| `categories` | `IGameCategoryResponse[]` | All game categories fetched from backend |
| `activeCategory` | `string` | ID of the currently selected tab |
| `resultGroups` | `DateGroup[]` | Date-grouped result records shown in the list |
| `pageNum` | `number` | Current zero-based page index for pagination |
| `isCatLoading` | `boolean` | Hides tab bar while categories are loading |
| `isLoading` | `boolean` | Shows full-list loading on first page fetch |
| `isRefreshing` | `boolean` | Drives `FlatList` pull-to-refresh spinner |

**Refs (stale-closure guards & mutexes):**

| Ref | Role |
|---|---|
| `flatListRef` | Programmatic scroll-to-top on tab switch |
| `activeCatRef` | Mirrors `activeCategory` — read inside async callbacks to avoid stale closures |
| `isFetchingMore` | Mutex — prevents duplicate pagination calls on fast scroll |
| `hasInteracted` | `true` only after the user starts scrolling; gates `onEndReached` to prevent false triggers on mount |
| `hasMore` | `false` when `(page + 1) * PER_PAGE >= TOTAL`; stops further pagination |

---

### Business Logic

#### 1. Session Validation (on every focus)

`fetchUserDetails` runs on every `useFocusEffect` cycle. It re-fetches the user profile using the stored email. If the backend returns `STATUS = 'INACTIVE'`, `clearAllStores()` is called immediately, wiping all Zustand stores and triggering a logout.

#### 2. Admin Details Sync (on every focus)

`fetchAdminDetails` is called alongside `fetchUserDetails` on every focus. It writes global admin configuration (e.g., support contact) into `adminDetailsStore`, which is consumed by modals elsewhere in the post-auth tree.

#### 3. Category Load & Auto-select (on every focus)

`fetchCategories` fetches the full list of game categories via `Repository.Game.getAllGameCategories`. On success it:
- Stores the list in `categories` state.
- Auto-selects the **first category** (`data[0].ID`).
- Writes that ID into both `activeCategory` state and `activeCatRef`.
- Resets `pageNum` to 0, clears `resultGroups`, and resets `hasMore` / `hasInteracted`.
- Immediately calls `fetchResults(firstId, 0, false)`.

While categories are loading, the tab bar is hidden entirely (`isCatLoading`).

#### 4. Result Fetch (`fetchResults`)

`fetchResults(categoryId, page, append)` is the single source of truth for loading records.

**API payload** (`buildPayload`):

| Filter field | Operator | Value | Effect |
|---|---|---|---|
| `GAME_MASTER.NAME` | `LIKE` | `''` | Match all games (wildcard search) |
| `GAME_MASTER.CATEGORY_ID` | `=` | `categoryId` | Scope to selected category |
| `GAME_CATEGORY.STATUS` | `=` | `'ACTIVE'` | Only active categories |
| `GAME_MASTER.GAME_DATE` | `<=` | today (`YYYY-MM-DD`) | Only past/today draws |

Sort: `GAME_MASTER.GAME_DATE DESC` — newest draws first.

Pagination is offset-based: `offset = PER_PAGE * page`, `limit = PER_PAGE` (`PER_PAGE = 10`).

**Published-only filter:** After the API responds, only schedule items where `RESULT_PUBLISH !== 0` are included — unpublished results are silently dropped client-side.

**Flattening:** Each game in the response can have multiple `SCHEDULE_DETAILS`. The code flattens them into a single `FlatResultItem[]`, tagging each item with its parent's `GAME_DATE` and `NAME`.

**Merging into groups** (`mergeIntoGroups`): The flat array is merged into the existing `DateGroup[]` using a `Map<GAME_DATE, FlatResultItem[]>`. Items for an already-present date are appended to that group; new dates create a new group. When `append = false` (first page / refresh), it merges into an empty `[]`, effectively replacing the list.

#### 5. Category Tab Switch

Pressing a tab calls `onTabPress`. If the same tab is already active the call is a no-op. Otherwise:
- Updates `activeCategory` state and `activeCatRef`.
- Resets `pageNum` to 0, clears `resultGroups`, resets `hasMore` and `hasInteracted`.
- Scrolls `FlatList` back to the top via `flatListRef`.
- Fetches results for the new category from page 0 (`append = false`).

#### 6. Pagination (Infinite Scroll)

`onEndReached` fires when the user scrolls within 30% of the list bottom (`onEndReachedThreshold={0.3}`). It is guarded by five conditions — all must pass:

| Guard | Reason |
|---|---|
| `hasInteracted.current === true` | Skips the false-positive trigger that React Native fires on initial mount/layout |
| `distanceFromEnd >= 0` | Avoids a known RN negative-distance false positive |
| `resultGroups.length > 0` | No pagination on an empty list |
| `!isLoading && !isFetchingMore.current` | Prevents concurrent fetches |
| `hasMore.current === true` | Stops when all records are loaded |

On a valid trigger, `pageNum` increments and `fetchResults` is called with `append = true`.

#### 7. Pull-to-Refresh

`onRefresh` sets `isRefreshing = true`, resets `pageNum` to 0 and `hasMore` / `hasInteracted`, then calls `fetchResults` with the current `activeCatRef` and `append = false`. `isRefreshing` is reset inside the `finally` block of `fetchResults`.

---

### Helper Functions

#### `buildPayload(categoryId: string): IGameResultRequest`

Constructs the API request body with four `search` filters (see table above) and a fixed `DESC` sort on `GAME_MASTER.GAME_DATE`. Centralising this here means `fetchResults` stays readable and the filter logic is testable in isolation.

#### `formatCardName(name: string | null): string`

```ts
formatCardName('ace-of-spades') // → "Ace Of Spades"
```

Transforms a hyphen-separated card identifier into a human-readable title:
1. Replaces all `-` with spaces.
2. Title-cases each word (`\b\w` → uppercase).
Returns `''` for `null`/falsy input.

#### `mergeIntoGroups(prev: DateGroup[], newItems: FlatResultItem[]): DateGroup[]`

Incrementally merges a fresh batch of flat items into the current date-group list without re-sorting:
- Builds a `Map` from the existing groups (preserving order).
- For each new item: if its date already exists in the map, append to that bucket; otherwise create a new bucket.
- Converts the map back to an array, retaining insertion order (newest first, as delivered by the API).

---

### Render Structure

```
<ImageBackground source={DASHBOARD_SPLASH}>
  <GradientIconBar />                          ← shared top nav bar

  {!isCatLoading && categories.length > 0 &&
    <HorizontalTabBar                          ← category filter tabs
      tabs={categories}
      activeKey={activeCategory}
      onPress={onTabPress}
    />
  }

  <FlatList data={resultGroups}
    keyExtractor={item => item.GAME_DATE}      ← one entry per date
    renderItem={renderItem}                    ← see below
    ListEmptyComponent={<ListEmpty />}         ← EmptyState when no results
    ListFooterComponent={<ListFooter />}       ← "Loading more..." indicator
    onScrollBeginDrag → hasInteracted = true   ← enables pagination
    onEndReached={onEndReached}
    onRefresh={onRefresh}
  />
</ImageBackground>
```

#### `renderItem` — Date Group Card

Each `DateGroup` renders as a two-layer visual unit:

```
┌─ [date badge] ─────────────────────────────────┐   ← gold gradient pill (floated above card, zIndex applied)
│                                                 │
│  [card body — dark purple gradient]             │
│  ┌─ row ─────────────────────────────────────┐ │
│  │  [schedule name — gold GradientText]      │ │
│  │  [card image]  [card name — formatted]    │ │
│  └───────────────────────────────────────────┘ │
│  ─────────────────── divider ─────────────────  │   ← 1px white line, not after last row
│  ┌─ row ─────────────────────────────────────┐ │
│  │  ...                                      │ │
│  └───────────────────────────────────────────┘ │
└─────────────────────────────────────────────────┘
```

- **Date badge**: `LinearGradient` `['#FFD700', '#D4940A']` — gold-to-amber, displays `DD-MM-YYYY`.
- **Card body**: `LinearGradient` `['#260030', '#44004F']` — dark purple.
- **Schedule name**: `GradientText` with `Colors.GRADIENT.GOLD` at `180°`.
- **Card image**: loaded from `ENV.BASE_URL + schedule.CARD_IMAGE_URL`; falls back to `Images.SMALL_CARD` for broken URLs.
- **Card name**: `formatCardName(schedule.CARD_NAME)` with `numberOfLines={1}` clamp.
- **Divider**: rendered only between rows (`index < item.items.length - 1`).

#### `ListFooter`

Renders a `"Loading more..."` text row when `hasMore.current === true` and the list is non-empty. Hidden when all pages are loaded or the list is empty.

#### `ListEmpty`

Returns `null` while the first page is loading (avoids flash). After loading completes with no data, renders `<EmptyState image={Images.RESULT} title="No Results Found" subtitle="No published results for this category." />`.

---

### Component Reference

#### `GradientIconBar`

**File:** `src/components/GradientIconBar.tsx`

Shared top navigation bar with gradient background. See the **Home Screen** section for full details.

---

#### `HorizontalTabBar`

**File:** `src/components/HorizontalTabBar.tsx`

A horizontally scrollable row of category tabs. The active tab is highlighted.

| Detail | Value |
|---|---|
| Props | `tabs: IGameCategoryResponse[]`, `activeKey: string`, `onPress: (tab) => void` |
| Reusable | Yes — used by Result, PlayHistory, and any screen that needs category filtering |

```tsx
import HorizontalTabBar from 'src/components/HorizontalTabBar';

<HorizontalTabBar
  tabs={categories}
  activeKey={activeCategory}
  onPress={(tab) => onTabPress(tab)}
/>
```

---

#### `EmptyState`

**File:** `src/components/EmptyState.tsx`

Generic empty-list placeholder with a centred image, title, and subtitle.

| Detail | Value |
|---|---|
| Props | `image: ImageSourcePropType`, `title: string`, `subtitle: string` |
| Reusable | Yes — pass any image and copy |

```tsx
import EmptyState from 'src/components/EmptyState';

<EmptyState
  image={Images.RESULT}
  title="No Results Found"
  subtitle="No published results for this category."
/>
```

---

#### `GradientText`

**File:** `src/components/GradientText.tsx`

Renders text with a linear gradient fill using `react-native-linear-gradient` and SVG masking.

| Detail | Value |
|---|---|
| Props | `colors: string[]`, `style?: TextStyle`, `angle?: number`, `children: ReactNode` |
| Used in Result | Schedule name rows — `Colors.GRADIENT.GOLD` at `180°` |

---

#### `CustomText`

**File:** `src/components/CustomText.tsx`

A thin wrapper around `Text` that applies the project-wide font family. Drop-in replacement for `<Text>` throughout the app.

---

### Implementation Notes

- **Stale closure prevention**: `activeCatRef` is kept in sync with `activeCategory` state on every write. The async `fetchResults` callback reads `activeCatRef.current` rather than capturing the state variable, ensuring it always uses the latest category even after React batches state updates.
- **`hasInteracted` gate**: React Native's `FlatList` can fire `onEndReached` immediately on mount before the user scrolls. Setting `hasInteracted.current = true` only inside `onScrollBeginDrag` ensures the first pagination call is always user-initiated.
- **`mergeIntoGroups` idempotency**: passing `[]` as `prev` is equivalent to a full list replacement, so `fetchResults` can use the same merge helper for both first-load and append scenarios.
- **UTC date formatting**: `moment(item.GAME_DATE).utc().format('DD-MM-YYYY')` is used to prevent local timezone offsets from shifting dates when the API returns midnight UTC timestamps.

---

## PlayGame Screen

**File:** `src/pages/PostAuth/PlayGame/PlayGame.tsx`
**Styles:** `src/pages/PostAuth/PlayGame/styles.tsx`

The PlayGame screen is the primary game-entry surface. It lets a user browse suit-grouped playing cards, select one or more cards, enter a bet amount per card, accumulate a line-item list, and submit all bets in a single API call.

---

### Route Params

Received via `useRoute<RouteProp<HomeStackParamList, 'PlayGame'>>`:

| Param | Type | Description |
|---|---|---|
| `GAME_MASTER_SCHEDULE_ID` | `string` | Identifies the specific game session being played |
| `GAME_CATEGORY` | `string` | Category ID used for rule lookups and bet submission |
| `cardImages` | `string` | JSON-serialised `PlayOption[]` — the full set of playable cards for this game |

---

### Type Definitions

```ts
// A single bet line: one card + the user-entered amount
interface LineItem {
  card: PlayOption;   // full card metadata
  amount: string;     // raw string from TextInput (integer-only, no leading zeros)
}

// One horizontal page of cards, grouped by suit
interface CardGroup {
  suitKey: string;    // raw suit identifier (e.g. "hearts")
  suitLabel: string;  // uppercased display label (e.g. "HEARTS")
  cards: PlayOption[]; // cards within this suit, sorted by cardOrder
}

// Defined in CardItem.tsx — a single playable card option
interface PlayOption {
  ID: number;
  NAME: string;       // hyphen-separated (e.g. "ace-of-spades")
  IMAGE_URL: string;  // relative path — prefixed with ENV.BASE_URL at render
  TYPE?: string;      // suit key override
  typeOrder?: number; // controls suit group order
  cardOrder?: number; // controls card order within suit
}
```

---

### Data Flow

```
route.params.cardImages (JSON string)
  │
  ▼ useMemo → JSON.parse → groupBySuit()
  │
  ▼ cardGroups: CardGroup[]            ← immutable for screen lifetime
        │
        ▼ FlatList (horizontal, paged)
              │
              └─ AnimatedCard per card
                    │ onPress → onCardPress()
                    ▼
              selectedCardIds: Set<number>
                    │
                    ▼ onAddLineItem()
              lineItems: LineItem[]
                    │
                    ▼ onPlayGame()
              Repository.Game.playGameMultiple(body)
```

---

### State Architecture

| State | Type | Initial | Role |
|---|---|---|---|
| `currentGroupIndex` | `number` | `0` | Tracks which suit page the horizontal FlatList is showing |
| `selectedCardIds` | `Set<number>` | `new Set()` | Holds IDs of all cards the user has tapped but not yet added |
| `amount` | `string` | `''` | Controlled value for the bet amount TextInput |
| `lineItems` | `LineItem[]` | `[]` | Accumulates bet line items before submission |
| `isDropdownOpen` | `boolean` | `false` | Controls visibility of the suit-picker Modal |
| `gameRules` | `IGameRulesItem[]` | `[]` | Full rule set fetched from backend; used for MIN_BET / MAX_BET validation |
| `isPlaying` | `boolean` | `false` | Disables the Play button and swaps label to "PLACING BETS..." during submission |
| `isRefreshing` | `boolean` | `false` | Drives the pull-to-refresh spinner |
| `confirmDeleteId` | `number \| null` | `null` | Holds the card ID of a line item in the inline delete-confirmation state |
| `gameType` | `IGameTypeResponse[]` | `[]` | Game type list — only `gameType[0]` is used (first/default type) |

**Refs:**

| Ref | Role |
|---|---|
| `flatListRef` | `FlatList<CardGroup>` ref — used by `selectGroup` to programmatically scroll to a suit page |
| `onViewableItemsChanged` | Stable callback ref (created once via `useRef`) — prevents FlatList from re-registering the handler on every render |
| `viewabilityConfig` | Stable config ref — `itemVisiblePercentThreshold: 50` |

**Derived value:**

```ts
const currentGroup = cardGroups[currentGroupIndex];
// Used to display the dropdown label and to be safe against out-of-bounds index on re-renders
```

---

### `cardImages` Parsing & `groupBySuit` — How Cards Are Organised on Screen

#### What problem does this solve?

When the server sends cards to the app, it sends them as one list. All cards from all suits arrive together. The server already decides their order — which suit should appear first, and which card should appear first within each suit.

The app needs to split this one list into **separate pages** — one page per suit — and display each page in the horizontal swiper. `groupBySuit` is the function that does this splitting work.

Think of it like a card dealer who has already arranged the deck in the right order. They hand it to you in one pile, and all you need to do is cut it into groups wherever the suit changes — no shuffling, no re-sorting, just slicing.

---

#### What the server sends — the raw list

Each card has exactly three fields:

| Field | Example value | What it means |
|---|---|---|
| `ID` | `13` | Unique ID of the card |
| `NAME` | `"Spade A"` | Display label shown under the card image |
| `IMAGE_URL` | `"spade-a.png"` | Filename of the card image |

Below is the full 16-card list from a real response. Notice: all Spade cards come first, then Hearts, then Diamonds, then Clubs — **the server controls this order**:

| ID | NAME | IMAGE_URL |
|---|---|---|
| 13 | `Spade A` | `spade-a.png` |
| 16 | `Spade K` | `spade-k.png` |
| 15 | `Spade Q` | `spade-q.png` |
| 14 | `Spade J` | `spade-j.png` |
| 9  | `Heart A` | `heart-a.png` |
| 12 | `Heart K` | `heart-k.png` |
| 11 | `Heart Q` | `heart-q.png` |
| 10 | `Heart J` | `heart-j.png` |
| 5  | `Diamond A` | `diamond-a.png` |
| 8  | `Diamond K` | `diamond-k.png` |
| 7  | `Diamond Q` | `diamond-q.png` |
| 6  | `Diamond J` | `diamond-j.png` |
| 1  | `Clubs A` | `clubs-a.png` |
| 4  | `Clubs K` | `clubs-k.png` |
| 3  | `Clubs Q` | `clubs-q.png` |
| 2  | `Clubs J` | `clubs-j.png` |

---

#### How the suit name is read from `IMAGE_URL`

Every `IMAGE_URL` follows the pattern `<suit>-<rank>.png`. To get the suit name, the function splits the filename on `"-"` and takes the first piece:

```
"spade-a.png"    →  split("-")  →  ["spade", "a.png"]   →  suit key = "spade"
"heart-k.png"    →  split("-")  →  ["heart", "k.png"]   →  suit key = "heart"
"diamond-q.png"  →  split("-")  →  ["diamond", "q.png"] →  suit key = "diamond"
"clubs-j.png"    →  split("-")  →  ["clubs", "j.png"]   →  suit key = "clubs"
```

The `.png` extension stays on the second piece and is never read — only the first piece (before the first `-`) is used.

---

#### Step 1 — Walk through the list and open a bucket the first time a new suit is seen

The function reads the array from index 0 to the end, one card at a time. For each card it extracts the suit key (as shown above), then:

- **If this suit key has not been seen before** → open a new bucket for it, in this exact position
- **If this suit key already has a bucket** → drop the card into that existing bucket

Using the sample data above, here is what happens card by card:

| Step | Card | Suit key | Action |
|---|---|---|---|
| 0 | Spade A | `spade` | New bucket opened: **spade** |
| 1 | Spade K | `spade` | Added to spade bucket |
| 2 | Spade Q | `spade` | Added to spade bucket |
| 3 | Spade J | `spade` | Added to spade bucket |
| 4 | Heart A | `heart` | New bucket opened: **heart** |
| 5 | Heart K | `heart` | Added to heart bucket |
| 6 | Heart Q | `heart` | Added to heart bucket |
| 7 | Heart J | `heart` | Added to heart bucket |
| 8 | Diamond A | `diamond` | New bucket opened: **diamond** |
| … | … | … | … |
| 12 | Clubs A | `clubs` | New bucket opened: **clubs** |
| … | … | … | … |

The **page order** (Spade → Heart → Diamond → Clubs) is determined entirely by the order in which the server placed cards in the list — whichever suit appears first at index 0 becomes page 1.

There is **no re-sorting** at any point. The function trusts the server's order completely.

---

#### Step 2 — No sorting needed

Cards inside each bucket are already in the correct display order because they were appended in the same sequence they arrived from the server. There is nothing more to do.

```
spade   → [Spade A,   Spade K,   Spade Q,   Spade J]   ← server order kept
heart   → [Heart A,   Heart K,   Heart Q,   Heart J]   ← server order kept
diamond → [Diamond A, Diamond K, Diamond Q, Diamond J] ← server order kept
clubs   → [Clubs A,   Clubs K,   Clubs Q,   Clubs J]   ← server order kept
```

---

#### Final output — what `groupBySuit` returns

Four `CardGroup` objects, one per suit, in the order they were first encountered:

```
[
  {
    suitKey:   "spade",
    suitLabel: "SPADE",
    cards: [Spade A, Spade K, Spade Q, Spade J]
  },
  {
    suitKey:   "heart",
    suitLabel: "HEART",
    cards: [Heart A, Heart K, Heart Q, Heart J]
  },
  {
    suitKey:   "diamond",
    suitLabel: "DIAMOND",
    cards: [Diamond A, Diamond K, Diamond Q, Diamond J]
  },
  {
    suitKey:   "clubs",
    suitLabel: "CLUBS",
    cards: [Clubs A, Clubs K, Clubs Q, Clubs J]
  }
]
```

---

#### What this means on screen

Each `CardGroup` becomes **one full-width page** in the horizontal card swiper:

```
◀  [SPADE page]  ──swipe──  [HEART page]  ──swipe──  [DIAMOND page]  ──swipe──  [CLUBS page]  ▶
   A  K  Q  J               A  K  Q  J               A  K  Q  J                A  K  Q  J
```

The dropdown at the top of the screen shows the current page's `suitLabel`. Tapping it opens the suit-picker modal, which lists all `suitLabel` values so the user can jump directly to any page without swiping.

This grouping is computed **once when the screen loads** and never recalculated — the card list does not change during a session.

---

### Data Fetching

All four fetches are fired in parallel on every `useFocusEffect` cycle via `fetchAll`.

#### `fetchGameTypes`

```
Repository.Game.getAllGameTypes()
  → setGameType(data)
```

Loads all game type records. Only `gameType[0]` (the first/default type) is consumed downstream — its `ID` is used as `GAME_TYPE` in the play payload, and its `SUB_TYPE` is passed as `SUB_TYPE`.

#### `fetchGameRules`

```
Repository.Game.getAllGameRules({ filters: { search: [] } })
  → sort by CAT_ORDER_BY ASC, TYPE_NAME DESC
  → setGameRule(sorted)
```

Fetches the full rule list and applies a client-side sort: primary key `CAT_ORDER_BY` ascending, secondary key `TYPE_NAME` descending (lexicographic). The sorted list is stored in `gameRules`.

Inside `onAddLineItem`, the active rule is resolved by matching both `CATEGORY_ID === GAME_CATEGORY` and `TYPE_ID === gameType[0]?.ID`. This gives the `MIN_BET` and `MAX_BET` for the current game session.

#### `fetchWalletBalance`

```
Repository.User.getUserBalance(userDetails.ID)
  → setWallet(data)          ← updates walletStore globally
```

Re-fetches the live wallet balance and writes it into the shared `walletStore`. Called on focus and again after a successful `onPlayGame` submission to reflect the deducted amount immediately.

#### `fetchAdminDetails`

```
Repository.User.adminDetails()
  → setAdminDetails(data)    ← updates adminDetailsStore globally
```

Syncs global admin configuration (e.g. support contact) into `adminDetailsStore` on every focus.

#### `fetchAll`

```ts
await Promise.all([
  fetchAdminDetails(),
  fetchGameTypes(),
  fetchGameRules(),
  fetchWalletBalance(),
]);
```

All four calls are issued concurrently. There is no ordering dependency between them. `useFocusEffect` wraps this so it fires each time the screen comes into focus (including back-navigation).

#### `onRefresh`

```ts
setIsRefreshing(true)
await fetchAll()
setIsRefreshing(false)   // in finally
```

Drives the `RefreshControl` spinner. Calls `fetchAll` and resets the spinner in `finally` so it always clears even if a fetch throws.

---

### Card Interaction Logic

#### `onCardPress(card: PlayOption)`

Toggles a card's selection state using an immutable `Set` copy pattern:

```ts
setSelectedCardIds(prev => {
  const next = new Set(prev);
  next.has(card.ID) ? next.delete(card.ID) : next.add(card.ID);
  return next;
});
```

Multiple cards can be selected simultaneously. The selection persists across horizontal-swipe pages because `selectedCardIds` is a screen-level `Set`, not per-group. Each `AnimatedCard` receives `isSelected={selectedCardIds.has(card.ID)}` and the FlatList re-renders via `extraData={selectedCardIds}`.

#### `selectGroup(index: number)`

Programmatic navigation to a suit page triggered from the dropdown modal:

```ts
setCurrentGroupIndex(index);
setIsDropdownOpen(false);
flatListRef.current?.scrollToIndex({ index, animated: true });
```

`scrollToIndex` works reliably because `getItemLayout` is provided (each page is exactly `SCREEN_WIDTH` wide), so the FlatList never needs to measure items before scrolling.

#### `onViewableItemsChanged`

```ts
const onViewableItemsChanged = useRef(({ viewableItems }) => {
  if (viewableItems.length > 0) setCurrentGroupIndex(viewableItems[0].index ?? 0);
}).current;
```

Keeps `currentGroupIndex` in sync when the user swipes the card pager manually. Wrapped in `useRef(...).current` so the reference is stable across renders — FlatList requires the `onViewableItemsChanged` prop reference to never change after mount.

`viewabilityConfig` uses `itemVisiblePercentThreshold: 50` — a page only becomes "current" once more than half of it is on screen.

---

### Bet Line Item Logic

#### `onAddLineItem`

Full validation chain before any state mutation:

| Step | Check | Error |
|---|---|---|
| 1 | `amount` is non-empty and parses to `> 0` | "Please enter a valid amount." |
| 2 | `selectedCardIds.size > 0` | "Please select at least one card." |
| 3 | Active rule exists (`CATEGORY_ID + TYPE_ID` match) | "No rules found for this game." |
| 4 | `numAmount >= activeRule.MIN_BET` | "Minimum bet is ₹N." |
| 5 | `numAmount <= activeRule.MAX_BET` | "Maximum bet is ₹N." |
| 6 | None of the selected cards already appear in `lineItems` | "Some selected cards are already added." |

On passing all checks:

```ts
setLineItems(prev => [
  ...prev,
  ...selectedCards.map(card => ({ card, amount })),
]);
setAmount('');
setSelectedCardIds(new Set());
```

All selected cards are added as individual `LineItem` entries sharing the same amount string. The amount field and selection are both cleared. `Keyboard.dismiss()` is called first to collapse the keyboard before mutating state.

**Amount input sanitisation** (in `onChangeText`):

```ts
text.replace(/[^0-9]/g, '').replace(/^0+/, '')
```

Strips all non-numeric characters, then removes leading zeros. Ensures only positive integers can enter the field.

#### `removeLineItem(cardId: number)`

```ts
setLineItems(prev => prev.filter(i => i.card.ID !== cardId));
```

Filters out the entry by card ID. Called only after the user confirms via the inline two-step delete UI (`confirmDeleteId` state drives the Cancel / Delete button pair).

**Inline delete flow:**
- First tap on trash icon → `setConfirmDeleteId(item.card.ID)` (renders Cancel + Delete buttons)
- Tap "Cancel" → `setConfirmDeleteId(null)` (restores normal view)
- Tap "Delete" → `removeLineItem(id)` + `setConfirmDeleteId(null)`

---

### Bet Submission — `onPlayGame`

Pre-submission guards (both non-async, checked synchronously):

| Guard | Error |
|---|---|
| `lineItems.length === 0` | "Please add at least one bet before playing." |
| `totalAmount > balance` | "Insufficient balance." — `totalAmount` is `lineItems.reduce((sum, i) => sum + parseFloat(i.amount), 0)` |

**Payload construction:**

```ts
const body = {
  GAME_MASTER_SCHEDULE_ID,          // from route.params
  GAME_TYPE: gameType[0]?.ID ?? '', // first game type ID
  USER_ID: userDetails?.ID ?? '',   // from userStore
  GAME_CATEGORY,                    // from route.params
  SUB_TYPE: gameType[0]?.SUB_TYPE ?? 'single',
  DATA: lineItems.map(i => ({
    GAME_NUMBER: i.card.ID.toString(),  // card ID cast to string
    AMOUNT: i.amount,                   // raw string (server expects string)
  })),
};
```

`DATA` is the array of individual bets. Each item carries `GAME_NUMBER` (the card's numeric ID serialised as a string) and `AMOUNT` (the user's input string, not a parsed number).

**After success:**

```ts
setLineItems([]);          // clears the bet slip
await fetchWalletBalance(); // reflects deducted balance immediately
```

`isPlaying` is reset in the `finally` block so the button is always re-enabled regardless of outcome.

---

### Animated Sub-component — `AnimatedCard`

```ts
interface AnimatedCardProps {
  card: PlayOption;
  isSelected: boolean;
  onPress: (card: PlayOption) => void;
  index: number;   // position within its suit group (0-based)
}
```

A `React.memo`-wrapped component that plays a deal-from-above animation using `react-native-reanimated` shared values. Wraps `CardItem` in an `Animated.View`.

**Shared values and their roles:**

| Shared Value | Initial | Animates to | Effect |
|---|---|---|---|
| `translateY` | `-70` | `0` | Card drops in from above |
| `opacity` | `0` | `1` | Card fades in |
| `rotate` | `DEAL_ROTATIONS[index % 14]` | `0` | Card straightens from a random tilt |
| `scale` | `0.78` | `1` | Card grows to full size |

`DEAL_ROTATIONS` is a fixed 14-element array of degree values (`[-7, 6, -5, 8, ...]`). Each card's initial tilt is `DEAL_ROTATIONS[index % 14]` — the modulo ensures the pattern wraps cleanly for groups larger than 14 cards.

**Stagger timing:** Each card's animation starts after `delay = index * 75` ms, creating a cascading deal effect. All four transforms animate simultaneously per card.

**Spring / Timing config:**

| Value | Easing | Config |
|---|---|---|
| `translateY` | `withSpring` | damping 14, stiffness 130 |
| `opacity` | `withTiming` | duration 180 ms |
| `rotate` | `withSpring` | damping 11, stiffness 100 |
| `scale` | `withSpring` | damping 13, stiffness 140 |

The animation fires once on mount (`useEffect` with empty deps `[]`). There is no teardown because the animation completes and shared values rest at their final state.

---

### Helper Functions

#### `groupBySuit(options: PlayOption[]): CardGroup[]`

See [How Cards Are Organised on Screen](#cardimages-parsing--groupbysuit--how-cards-are-organised-on-screen) above — that section walks through the full process with real data examples.

Extracts the suit key from each card's `IMAGE_URL` by splitting on `"-"` and taking the first segment (`"spade-a.png"` → `"spade"`). Uses a `Map` to bucket cards in first-encounter order — the order the server placed them in is preserved exactly, with no pre-sorting or within-bucket sorting.

#### `formatCardName(name: string | null): string`  *(defined in `CardItem.tsx`)*

```ts
const RANK_MAP = { a: 'ACE', k: 'KING', q: 'QUEEN', j: 'JACK' };

formatCardName('ace-of-spades')  // → "ACE OF SPADES"
formatCardName('k-hearts')       // → "KING HEARTS"
formatCardName(null)             // → ""
```

Splits on `-`, maps each segment through `RANK_MAP` (case-insensitive), uppercases unrecognised segments, then joins with space. Used in both `CardItem` labels and the line-item name column.

#### `getItemLayout(_: any, index: number)`

```ts
{ length: SCREEN_WIDTH, offset: SCREEN_WIDTH * index, index }
```

Enables `scrollToIndex` on the horizontal FlatList without measurement. Each page is exactly one `SCREEN_WIDTH` wide, making offset calculation trivial and O(1).

---

### Render Structure

```
<ImageBackground source={DASHBOARD_SPLASH}>

  <KeyboardAwareScrollView
    refreshControl={<RefreshControl onRefresh={onRefresh} />}
  >

    <Pressable onPress={() => setIsDropdownOpen(true)}>  ← suit dropdown trigger
      {currentGroup.suitLabel}
      <Image source={ANGLE_DOWN} />
    </Pressable>

    <FlatList                                             ← horizontal card pager
      ref={flatListRef}
      data={cardGroups}
      horizontal pagingEnabled
      renderItem={renderGroupPage}                        ← see below
      extraData={selectedCardIds}
      onViewableItemsChanged={onViewableItemsChanged}
      getItemLayout={getItemLayout}
    />

    <View amountZone>
      <TextInput value={amount} onChangeText={sanitise} />
      <Pressable onPress={onAddLineItem}>Add</Pressable>
    </View>

    <View lineItemsSection>
      {lineItems.length === 0 && <EmptySlate />}
      {lineItems.length > 0 &&
        <>
          <SectionDivider label="ADDED LINE ITEMS" />
          {lineItems.map(item =>
            <LineItemRow                                  ← see below
              item={item}
              isPendingDelete={confirmDeleteId === item.card.ID}
            />
          )}
        </>
      }
    </View>

  </KeyboardAwareScrollView>

  {lineItems.length > 0 &&
    <Pressable onPress={onPlayGame} disabled={isPlaying}>
      <LinearGradient>PLAY GAME / PLACING BETS...</LinearGradient>
    </Pressable>
  }

  <Modal visible={isDropdownOpen}>                        ← suit picker modal
    {cardGroups.map((group, i) =>
      <Pressable onPress={() => selectGroup(i)}>
        {group.suitLabel}  {i === currentGroupIndex && '✓'}
      </Pressable>
    )}
  </Modal>

</ImageBackground>
```

#### `renderGroupPage`

Renders one horizontal page of the card pager:

```
<View style={groupPage}>
  {item.cards.map((card, index) =>
    <AnimatedCard
      key={card.ID}
      card={card}
      index={index}
      isSelected={selectedCardIds.has(card.ID)}
      onPress={onCardPress}
    />
  )}
</View>
```

When a suit group has fewer than 4 cards, `justifyContent: 'center'` is applied inline so the cards are horizontally centred rather than left-aligned.

#### Line Item Row

Each `LineItem` renders as a horizontal row:

```
┌─[thumbnail]─┬─[card name]─────────────────┬─[₹amount]─┬─[🗑️]─┐
│  card image  │  formatCardName(item.card.NAME)  │  gold    │ red  │
└─────────────┴──────────────────────────────┴───────────┴──────┘
```

When `confirmDeleteId === item.card.ID`, the amount + trash column is replaced inline with:

```
┌─[thumbnail]─┬─[card name]─────────────────┬─[Cancel]─┬─[Delete]─┐
```

This avoids a modal or swipe gesture for deletion — the confirm UI is rendered directly in the row.

#### Play Game Button

Pinned outside `KeyboardAwareScrollView` so it is always visible at the bottom of the screen regardless of scroll position. Only rendered when `lineItems.length > 0`.

- **Idle:** gold gradient (`Colors.GRADIENT.SPACER_CORE`), label "PLAY GAME"
- **Submitting:** flat disabled background (`Colors.DISABLED_BG`), label "PLACING BETS..."

---

### Suit Picker Modal

```
<Modal visible={isDropdownOpen} transparent animationType="fade">
  <Pressable overlay onPress={() => setIsDropdownOpen(false)}>
    <View dropdownModal>
      <LinearGradient header>SELECT CATEGORY</LinearGradient>
      {cardGroups.map((group, index) =>
        <Pressable
          onPress={() => selectGroup(index)}
          style={[dropdownItem,
            index === currentGroupIndex && dropdownItemActive,
            index < last && dropdownItemBorder
          ]}
        >
          {group.suitLabel}
          {index === currentGroupIndex && <Text>✓</Text>}
        </Pressable>
      )}
    </View>
  </Pressable>
</Modal>
```

Tapping the overlay (`Pressable` wrapping the modal content) dismisses the modal. The active group is highlighted with a subtle gold tint background and a `✓` checkmark on the right.

---

### Component Reference

#### `AnimatedCard`

**Defined inline in `PlayGame.tsx`**

`React.memo`-wrapped deal-animation wrapper. Accepts `card`, `isSelected`, `onPress`, and `index`. Plays a staggered drop-in animation on mount, then delegates rendering to `CardItem`. Memoised to prevent re-animation when parent state (e.g. `selectedCardIds`) changes.

---

#### `CardItem`

**File:** `src/components/CardItem.tsx`

Renders a single playable card as a pressable tile:

| Detail | Value |
|---|---|
| Props | `card: PlayOption`, `isSelected: boolean`, `onPress: (card) => void` |
| Selected state | Green border (`#22cc44`), elevated shadow, green `✓` badge at top-right |
| Image source | `${ENV.BASE_URL}/${card.IMAGE_URL}` with `Images.SMALL_CARD` as `defaultSource` |
| Label | `formatCardName(card.NAME)` — truncated to 1 line |

---

#### `SectionDivider`

**File:** `src/components/SectionDivider.tsx`

A labelled horizontal rule: two `flex: 1` lines flank a centred text label in gold. Used as the header above the line-item list.

| Detail | Value |
|---|---|
| Props | `label: string` |
| Used in PlayGame | `label="ADDED LINE ITEMS"` |

---

### Implementation Notes

- **`cardImages` parsed once**: The JSON string from route params is parsed inside `useMemo` with `[cardImages]` as its dependency. Because navigation params are set at push-time and never mutated, this memo never re-fires mid-session — the parse cost (and `groupBySuit` grouping pass) is paid exactly once.
- **`selectedCardIds` as immutable Set**: Every `onCardPress` call creates a new `Set` instance. This ensures React detects the state change (object identity), and FlatList's `extraData={selectedCardIds}` triggers re-renders for the correct cards.
- **`onViewableItemsChanged` stability**: Assigning the handler inside `useRef(...).current` satisfies the FlatList requirement that this prop never changes after mount. Using a plain arrow function in JSX would cause FlatList to silently ignore viewability updates.
- **`getItemLayout` requirement for `scrollToIndex`**: Without `getItemLayout`, calling `flatListRef.current?.scrollToIndex` on a horizontal pager would throw a warning and may silently no-op. Providing it makes offset calculation O(1) and scroll reliable.
- **Two-step delete UX**: `confirmDeleteId` enables an inline confirmation flow with zero modals or swipe gestures. Setting it to `null` on any navigation-away or other card addition is not needed — stale `confirmDeleteId` is harmless because the referenced card ID will either still be in `lineItems` (correct) or be gone (the `isPendingDelete` branch simply never renders).
- **Wallet refresh post-play**: `fetchWalletBalance` is called inside the `onPlayGame` success path (not in `finally`) to ensure the balance only updates when the bets are confirmed server-side, not on error paths.

---

To learn more about React Native, take a look at the following resources:

- [React Native Website](https://reactnative.dev) - learn more about React Native.
- [Getting Started](https://reactnative.dev/docs/environment-setup) - an **overview** of React Native and how setup your environment.
- [Learn the Basics](https://reactnative.dev/docs/getting-started) - a **guided tour** of the React Native **basics**.
- [Blog](https://reactnative.dev/blog) - read the latest official React Native **Blog** posts.
- [`@facebook/react-native`](https://github.com/facebook/react-native) - the Open Source; GitHub **repository** for React Native.
