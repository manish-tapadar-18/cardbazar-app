import React, { useCallback, useEffect, useState } from 'react'
import {
  FlatList,
  ImageBackground,
  Platform,
  RefreshControl,
  TouchableOpacity,
  View,
} from 'react-native'
import { useFocusEffect, useNavigation } from '@react-navigation/native'
import { Images } from '../../../utils/Images'
import { styles } from './styles'
import GradientIconBar from '../../../components/GradientIconBar'
import CustomText from '../../../components/CustomText'
import { IGameCategoryResponse } from '../../../response/module/IGameCategoryResponse'
import { Repository } from '../../../repository/Repository'
import { Toast } from '../../../utils/toast'
import { Colors } from '../../../utils/Colors'
import { useUserStore } from '../../../stores/userStore'
import { useWalletStore } from '../../../stores/walletStore'
import CardSkeleton from './components/CardSkeleton'
import CategoryCard from './components/CategoryCard'
import { getFCMToken } from '../../../utils/PushNotificationUtils'
import DeviceInfo, { getUniqueId } from 'react-native-device-info';
import { FilterPayloadContainer, UpdateDeviceRequestBody } from '../../../services/interfaces/IUserService'
import { useDeviceModalStore } from '../../../stores/deviceModalStore'
import { useAdminDetailsStore } from '../../../stores/adminDetailsStore'
import { clLog, clRecordError, clSetAttribute, clSetUser, TAGS } from '../../../utils/CrashlyticsUtils'
import DeviceBlockModal from '../../../components/DeviceBlockModal'
import MultiLoginModal from '../../../components/MultiLoginModal'
import EmptyState from '../../../components/EmptyState'
import CardRevealModal from '../../../components/CardRevealModal'
const SKELETON_COUNT = 4

const ListHeader: React.FC = () => (
  <View style={styles.listHeader}>
    <CustomText style={styles.listHeaderText}>ALL GAMES</CustomText>
  </View>
)

const SkeletonList: React.FC = () => (
  <View style={styles.skeletonContainer}>
    <ListHeader />
    {Array.from({ length: SKELETON_COUNT }).map((_, i) => (
      <CardSkeleton key={i} />
    ))}
  </View>
)

const Home = () => {
  const [gameCategories, setGameCategories] = useState<IGameCategoryResponse[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [showReveal, setShowReveal] = useState(false)
  // ── Card reveal controls (change these to test different outcomes) ─────────
  const revealWinner: 0 | 1 | 2 | 3 = 2          // 0=card1  1=card2  2=card3  3=card4
  const revealExitMode: 'fadeOut' | 'scatter' = 'scatter'  // 'fadeOut' | 'scatter'
  // ─────────────────────────────────────────────────────────────────────────
  const navigation = useNavigation();
  const { userDetails } = useUserStore();
  const { setWallet } = useWalletStore();
  const { openDeviceBlock, closeDeviceBlock, openMultiLogin, closeMultiLogin } = useDeviceModalStore();
  const { setAdminDetails } = useAdminDetailsStore();

  // Runs once on mount: fetch full profile then sync FCM token if it changed
  useEffect(() => {
    getProfileDetails();
  }, []);

  const updateFCMTokenAPI = async (userId: string): Promise<void> => {
    clLog(TAGS.HOME, `updateFCMTokenAPI — userId: ${userId}`);
    try {
      const fcmToken = await getFCMToken();
      if (!fcmToken) return;
      await Repository.User.UpdateUserFcm(userId);
    } catch (error: any) {
      clRecordError(TAGS.HOME, error, 'updateFCMTokenAPI');
      console.warn('[FCM] Token sync failed:', error?.message);
    }
  };

  const getProfileDetails = async (): Promise<void> => {
    clLog(TAGS.HOME, 'getProfileDetails — start');
    if (!userDetails?.EMAIL) return;
    try {
      const { isSuccess, data } = await Repository.User.userDetails({ EMAIL: userDetails.EMAIL });
      if (!isSuccess || !data || data.STATUS == 'INACTIVE') return;
      clSetUser(data.ID);
      clSetAttribute('email', data.EMAIL);
      const fcmToken = await getFCMToken();
      if (fcmToken && fcmToken !== data.FCM_TOKEN) {
        await updateFCMTokenAPI(data.ID);
      }
      checkDeviceId(data.ID);
    } catch (error: any) {
      clRecordError(TAGS.HOME, error, 'getProfileDetails');
      Toast.error(error?.message ?? 'Failed to load profile.', { placement: 'center', duration: 3000 });
    }
  };

  const checkDeviceId = async (userId: string) => {
    clLog(TAGS.HOME, `checkDeviceId — userId: ${userId}`);
    try {
      const deviceId = await getUniqueId();
      clSetAttribute('deviceId', deviceId);
      const filter: FilterPayloadContainer = {
        filters: {
          search: [
            {
              FIELD_NAME: 'U1.USER_ID',
              FIELD_VALUE: `${userId}`,
              OPT: '=',
            },
            {
              FIELD_NAME: 'DEVICE_MASTER.ID',
              FIELD_VALUE: '',
              OPT: '=',
            },
            {
              FIELD_NAME: 'DEVICE_MASTER.UNIQUE_ID',
              FIELD_VALUE: `${deviceId}`,
              OPT: '=',
            },
            {
              FIELD_NAME: 'U2.MOBILE',
              FIELD_VALUE: '',
              OPT: '=',
            },
          ],
          sortFilter: {
            FIELD_NAME: 'DEVICE_MASTER.ID',
            SORT_ORDER: 'DESC',
          },
        },
      };
      const { isSuccess, data } = await Repository.User.GetDeviceDetails(filter);
      if (!isSuccess || !data) return;
      if (data.DATA.length) {
        const status = data.DATA[0].STATUS;
        clLog(TAGS.HOME, `checkDeviceId — device status: ${status}`);
        if (status == 1) {
          closeDeviceBlock();
        } else {
          openDeviceBlock();
        }
      } else {
        const requestBody: UpdateDeviceRequestBody = {
          USER_ID: userId,
          DEVICE_ID: deviceId,
          DEVICE_DETAILS: {
            mode: Platform.OS,
            model: DeviceInfo.getModel(),
            manufacturer: await DeviceInfo.getManufacturer(),
            brand: DeviceInfo.getBrand(),
            os: DeviceInfo.getSystemName(),
            osVersion: DeviceInfo.getSystemVersion(),
            appVersion: DeviceInfo.getVersion(),
            appBuild: DeviceInfo.getBuildNumber(),
            appVersionCode: DeviceInfo.getVersion(),
            appPackageName: DeviceInfo.getBundleId(),
          },
        };
        const { isSuccess: updated } = await Repository.User.UpdateDevice(requestBody);
        if (updated) {
          closeMultiLogin();
        } else {
          openMultiLogin();
        }
      }
    } catch (error: any) {
      clRecordError(TAGS.HOME, error, 'checkDeviceId');
    }
  }

  useFocusEffect(React.useCallback(() => {
    fetchWalletBalance();
  }, []))

  useFocusEffect(React.useCallback(() => {
    const fetchAdminDetails = async () => {
      clLog(TAGS.HOME, 'fetchAdminDetails — start');
      try {
        const { isSuccess, data } = await Repository.User.adminDetails();
        if (isSuccess && data != null) setAdminDetails(data);
      } catch (error: any) {
        clRecordError(TAGS.HOME, error, 'fetchAdminDetails');
      }
    };
    fetchAdminDetails();
  }, []))

  const fetchWalletBalance = useCallback(async () => {
    const userId = userDetails?.ID;
    if (!userId) return;
    clLog(TAGS.HOME, `fetchWalletBalance — userId: ${userId}`);
    try {
      const { isSuccess, data } = await Repository.User.getUserBalance(userId);
      if (isSuccess && data) setWallet(data);
    } catch (error: any) {
      clRecordError(TAGS.HOME, error, 'fetchWalletBalance');
    }
  }, [userDetails?.ID]);

  const navigateToGameDetails = (id: string) => {
    (navigation as any).navigate('GameDetails', { categoryId: id })
  }

  const fetchAllGameCategories = useCallback(async () => {
    clLog(TAGS.HOME, 'fetchAllGameCategories — start');
    try {
      setIsLoading(true);
      setGameCategories([]);
      const catResponse = await Repository.Game.getAllGameCategories()
      const { isSuccess, data, message } = catResponse
      if (!isSuccess || !data) {
        Toast.error(`${message}`, { placement: 'center', duration: 3000 })
      } else {
        setGameCategories(data)
      }
    } catch (error: any) {
      clRecordError(TAGS.HOME, error, 'fetchAllGameCategories');
      Toast.error(`${error.message}`, { placement: 'center', duration: 3000 })
    } finally {
      setIsLoading(false)
    }
  }, [])

  useFocusEffect(
    useCallback(() => {
      fetchAllGameCategories()
    }, [fetchAllGameCategories]),
  )

  return (
    <>
    <ImageBackground
      source={Images.DASHBOARD_SPLASH}
      style={styles.background}
      resizeMode="cover"
    >
      <GradientIconBar />
      {isLoading && gameCategories.length === 0 ? (
        <SkeletonList />
      ) : (
        <FlatList
          data={gameCategories}
          keyExtractor={(item) => item.ID}
          renderItem={({ item }) => <CategoryCard item={item} onPress={(id) => navigateToGameDetails(id)} contestCount={item.SCHEDULE_COUNT} />}
          ListHeaderComponent={<ListHeader />}
          ListEmptyComponent={
            isLoading ? null : (
              <EmptyState
                image={Images.GAME_LIST}
                title="No Games Available"
                subtitle={"No active game categories right now.\nPull down to refresh."}
              />
            )
          }
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isLoading}
              onRefresh={fetchAllGameCategories}
              tintColor={Colors.GOLD}
              colors={[Colors.GOLD]}
            />
          }
        />
      )}
    </ImageBackground>
      <DeviceBlockModal onCheckDevice={checkDeviceId} />
      {/* <MultiLoginModal onRefresh={getProfileDetails} /> */}

      {/* TODO: remove — temp trigger for CardRevealModal testing */}
      <TouchableOpacity
        style={{
          position: 'absolute',
          bottom: 100,
          alignSelf: 'center',
          backgroundColor: Colors.GOLD,
          paddingHorizontal: 24,
          paddingVertical: 10,
          borderRadius: 20,
        }}
        onPress={() => setShowReveal(true)}
        activeOpacity={0.8}
      >
        <CustomText style={{ color: Colors.BLACK, fontWeight: '700', fontSize: 13, letterSpacing: 1 }}>
          TEST CARD REVEAL
        </CustomText>
      </TouchableOpacity>

      <CardRevealModal
        visible={showReveal}
        onClose={() => setShowReveal(false)}
        winnerIndex={revealWinner}
        exitMode={revealExitMode}
      />
    </>
  )
}

export default Home
