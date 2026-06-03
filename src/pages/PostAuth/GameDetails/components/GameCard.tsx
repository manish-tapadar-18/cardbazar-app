import React, { useEffect, useState } from 'react'
import { Image, Pressable, View } from 'react-native'
import LinearGradient from 'react-native-linear-gradient'
import moment from 'moment'
import { Images } from '../../../../utils/Images'
import { styles } from '../styles'
import CustomText from '../../../../components/CustomText'
import { IScheduleDetail } from '../../../../response/module/IGetAllGamesListResponse'
import { Colors } from '../../../../utils/Colors'
import GradientText from '../../../../components/GradientText'

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

const GameCard: React.FC<{ schedule: IScheduleDetail; isEnabled: boolean; onGameCardClick?: (schedule: IScheduleDetail) => void }> = React.memo(({ schedule, isEnabled, onGameCardClick }) => {
  const status = getStatus(schedule)

  // Only RUNNING cards need a local countdown ticker; UPCOMING/EXPIRED are static.
  const [countdown, setCountdown] = useState(() =>
    status === 'RUNNING' ? getRemainingTime(schedule.END_TIME) : ''
  )

  useEffect(() => {
    if (status !== 'RUNNING') return
    const id = setInterval(() => {
      const remaining = getRemainingTime(schedule.END_TIME)
      setCountdown(remaining)
      if (remaining === '00:00:00') clearInterval(id)
    }, 1000)
    return () => clearInterval(id)
  }, [schedule.END_TIME, status])

  return (
    <Pressable
      disabled={!isEnabled}
      onPress={() => { onGameCardClick?.(schedule) }}
      style={styles.cardWrapper}
    >
      <LinearGradient
        colors={Colors.GRADIENT.GRADIENTHEADER}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={styles.card}
      >
        <Image source={Images.CARD_ICON} style={styles.cardIcon} resizeMode="contain" />
        <View style={styles.cardContent}>
          <GradientText
            colors={Colors.GRADIENT.GOLD}
            locations={Colors.GRADIENT.GOLD_LOCATIONS}
            style={styles.cardTitle}
            angle={180}
          >
            {schedule.NAME}
          </GradientText>
          {status === 'RUNNING' && (
            <GradientText
              colors={Colors.GRADIENT.GOLD}
              locations={Colors.GRADIENT.GOLD_LOCATIONS}
              style={styles.runningTime}
              angle={180}
            >
              Ends in {countdown}
            </GradientText>
          )}
          {status === 'UPCOMING' && (
            <View style={styles.upcomingTimeRow}>
              <GradientText
                colors={Colors.GRADIENT.GOLD}
                locations={Colors.GRADIENT.GOLD_LOCATIONS}
                style={styles.upcomingTime}
                angle={180}
              >
                Starts at {formatTime(schedule.START_TIME)}
              </GradientText>
              <CustomText style={styles.upcomingTimeSpacer}>{'    '}</CustomText>
              <GradientText
                colors={Colors.GRADIENT.GOLD}
                locations={Colors.GRADIENT.GOLD_LOCATIONS}
                style={styles.upcomingTime}
                angle={180}
              >
                Ends at {formatTime(schedule.END_TIME)}
              </GradientText>
            </View>
          )}
          {status === 'EXPIRED' && (
            <GradientText
              colors={Colors.GRADIENT.GOLD}
              locations={Colors.GRADIENT.GOLD_LOCATIONS}
              style={styles.expiredTime}
              angle={180}
            >
              Ended at {formatTime(schedule.END_TIME)}
            </GradientText>
          )}
        </View>
      </LinearGradient>
    </Pressable>
  )
})

export default GameCard
