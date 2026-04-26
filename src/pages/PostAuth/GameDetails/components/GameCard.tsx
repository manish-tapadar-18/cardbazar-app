import React from 'react'
import { Image, Pressable, View } from 'react-native'
import LinearGradient from 'react-native-linear-gradient'
import moment from 'moment'
import { Images } from '../../../../utils/Images'
import { styles } from '../styles'
import CustomText from '../../../../components/CustomText'
import { IScheduleDetail } from '../../../../response/module/IGetAllGamesListResponse'

type GameStatus = 'RUNNING' | 'UPCOMING' | 'EXPIRED'

const getStatus = (schedule: IScheduleDetail): GameStatus => {
  const now = moment()
  const start = moment(schedule.START_TIME, 'HH:mm')
  const end = moment(schedule.END_TIME, 'HH:mm')
  if (now.isBefore(start)) return 'UPCOMING'
  if (now.isAfter(end)) return 'EXPIRED'
  return 'RUNNING'
}

const getRemainingTime = (endTime: string): string => {
  const diff = moment(endTime, 'HH:mm').diff(moment())
  if (diff <= 0) return '00:00:00'
  return moment.utc(diff).format('HH:mm:ss')
}

const formatTime = (time: string) => moment(time, 'HH:mm').format('hh:mm A')

const GameCard: React.FC<{ schedule: IScheduleDetail; isEnabled: boolean; onGameCardClick?: (schedule: IScheduleDetail) => void }> = ({ schedule, isEnabled, onGameCardClick }) => {
  const status = getStatus(schedule)
  return (
    <Pressable
      disabled={!isEnabled}
      onPress={() => { onGameCardClick?.(schedule) }}
      style={styles.cardWrapper}
    >
      <LinearGradient
        colors={['#FFD700', '#E8900C']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.card}
      >
        <Image source={Images.CARD_ICON} style={styles.cardIcon} resizeMode="contain" />
        <View style={styles.cardContent}>
          <CustomText style={styles.cardTitle}>{schedule.NAME}</CustomText>
          {status === 'RUNNING' && (
            <CustomText style={styles.runningTime}>
              Ends in {getRemainingTime(schedule.END_TIME)}
            </CustomText>
          )}
          {status === 'UPCOMING' && (
            <View style={styles.upcomingTimeRow}>
              <CustomText style={styles.upcomingTime}>
                Starts at {formatTime(schedule.START_TIME)}
              </CustomText>
              <CustomText style={styles.upcomingTimeSpacer}>{'    '}</CustomText>
              <CustomText style={styles.upcomingTime}>
                Ends at {formatTime(schedule.END_TIME)}
              </CustomText>
            </View>
          )}
          {status === 'EXPIRED' && (
            <CustomText style={styles.expiredTime}>
              Ended at {formatTime(schedule.END_TIME)}
            </CustomText>
          )}
        </View>
      </LinearGradient>
    </Pressable>
  )
}

export default GameCard
