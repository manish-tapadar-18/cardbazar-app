import React, { useCallback, useState } from 'react';
import {
  Image,
  ImageBackground,
  Pressable,
  ScrollView,
  Share,
  View,
} from 'react-native';
import Clipboard from '@react-native-clipboard/clipboard';
import LinearGradient from 'react-native-linear-gradient';
import { useFocusEffect } from '@react-navigation/native';
import GradientIconBar from '../../../components/GradientIconBar';
import CustomText from '../../../components/CustomText';
import ReferralHistoryModal from '../../../components/ReferralHistoryModal';
import { Images } from '../../../utils/Images';
import { Colors } from '../../../utils/Colors';
import { Repository } from '../../../repository/Repository';
import { Toast } from '../../../utils/toast';
import { useUserStore } from '../../../stores/userStore';
import { clearAllStores } from '../../../stores/clearAllStores';
import { styles } from './styles';
import { useAdminDetailsStore } from '../../../stores/adminDetailsStore';
import { IReferralHistoryItem } from '../../../response/module/IReferralHistoryResponse';

const Refer = () => {
  const [referralBonus, setReferralBonus] = useState<string | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [historyData, setHistoryData] = useState<IReferralHistoryItem[]>([]);
  const [isHistoryLoading, setIsHistoryLoading] = useState(false);
  const { userDetails } = useUserStore();
  const { setAdminDetails } = useAdminDetailsStore();
  const fetchUserAndReferralBonus = useCallback(async () => {
    const email = userDetails?.EMAIL;
    if (!email) return;

    try {
      const { isSuccess, data } = await Repository.User.userDetails({ EMAIL: email });

      if (!isSuccess || !data) {
        Toast.error('Failed to load user details.');
        return;
      }

      if (data.STATUS === 'INACTIVE') {
        clearAllStores();
        return;
      }

      const bonusResponse = await Repository.Referal.getReferralBonus();
      if (bonusResponse.isSuccess && bonusResponse.data) {
        setReferralBonus(bonusResponse.data.VALUE);
      } else {
        Toast.error(bonusResponse.message ?? 'Failed to load referral bonus.');
      }
    } catch (error: any) {
      Toast.error(error?.message ?? 'Something went wrong.');
    }
  }, [userDetails?.EMAIL]);

  useFocusEffect(
    useCallback(() => {
      const fetchAdminDetails = async () => {
        const { isSuccess, data } = await Repository.User.adminDetails();
        if (isSuccess && data != null) setAdminDetails(data);
      };
      fetchAdminDetails();
      fetchUserAndReferralBonus();
    }, [])
  );

  const onViewHistory = async () => {
    const userId = userDetails?.ID;
    if (!userId) return;
    setShowHistory(true);
    setIsHistoryLoading(true);
    try {
      const payload = {
        filters: {
          search: [
            { FIELD_NAME: 'REFERRAL.JOINED_USER_ID', FIELD_VALUE: '', OPT: '=' },
            { FIELD_NAME: 'REFERRAL.REFERRED_USER_ID', FIELD_VALUE: userId, OPT: '=' },
            { FIELD_NAME: 'REFERRAL.STATUS', FIELD_VALUE: '', OPT: '=' },
            { FIELD_NAME: 'REFERRAL.UPDATED_AT', FIELD_VALUE: '', OPT: '=' },
          ],
          sortFilter: { FIELD_NAME: 'REFERRAL.CREATED_AT', SORT_ORDER: 'ASC' as const },
        },
      };
      const { isSuccess, data, message } = await Repository.User.GetReferralHistory(payload);
      if (isSuccess && data) {
        setHistoryData(data.DATA);
      } else {
        Toast.error(message ?? 'Failed to load referral history.');
      }
    } catch (error: any) {
      Toast.error(error?.message ?? 'Something went wrong.');
    } finally {
      setIsHistoryLoading(false);
    }
  };

  const onCopyCode = () => {
    Clipboard.setString(referralCode);
    Toast.success('Referral code copied!');
  };

  const onShareNow = async () => {
    const code = userDetails?.REFERRAL_CODE ?? '';
    const bonus = referralBonus ?? '10';
    try {
      await Share.share({
        message: `Join me on CardBazar! Use my referral code ${code} when you register and play a game to earn FLAT INR ${bonus}. Download now!`,
      });
    } catch (error: any) {
      Toast.error(error?.message ?? 'Unable to share at this time.');
    }
  };

  const referralCode = userDetails?.REFERRAL_CODE ?? '—';
  const bonus = referralBonus ?? '0';

  return (
    <ImageBackground source={Images.DASHBOARD_SPLASH} style={styles.background} resizeMode="cover">
      <GradientIconBar />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Banner */}
        <Image
          source={Images.REFER_BANNER}
          style={styles.banner}
          resizeMode="cover"
        />

        {/* Referral Code Card */}
        <View style={styles.card}>
          <CustomText style={styles.cardLabel}>Referral Code:</CustomText>
          <LinearGradient
            colors={Colors.GRADIENT.SPACER_CORE}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.codePill}
          >
            <CustomText style={styles.codeText}>{referralCode}</CustomText>
            <Pressable onPress={onCopyCode} hitSlop={8} style={styles.copyBtn}>
              <Image source={Images.COPY} style={styles.copyIcon} resizeMode="contain" />
            </Pressable>
          </LinearGradient>
        </View>

        {/* Info text */}
        <CustomText style={styles.infoText}>
          {`If any person register with your referral code and play game, you will get FLAT INR ${bonus}.`}
        </CustomText>

        {/* Share Now button */}
        <Pressable style={styles.shareBtn} onPress={onShareNow}>
          <LinearGradient
            colors={Colors.GRADIENT.SPACER_CORE}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.shareBtnGradient}
          >
            <Image source={Images.SHARE} style={styles.shareIcon} resizeMode="contain" />
            <CustomText style={styles.shareBtnText}>Share Now</CustomText>
          </LinearGradient>
        </Pressable>

        {/* Divider */}
        <View style={styles.divider} />

        {/* View Referral History */}
        <Pressable style={styles.historyBtn} onPress={onViewHistory}>
          <CustomText style={styles.historyBtnText}>View Referral History</CustomText>
        </Pressable>
      </ScrollView>

      <ReferralHistoryModal
        visible={showHistory}
        data={historyData}
        isLoading={isHistoryLoading}
        onClose={() => setShowHistory(false)}
      />
    </ImageBackground>
  );
};

export default Refer;
