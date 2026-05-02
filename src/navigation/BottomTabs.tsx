import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { BottomTabParamList } from "./RouteTypes";
import { HomeStack } from "./HomeStack";
import { AddMoneyStack } from "./AddMoneyStack";
import { PlayHistoryStack } from "./PlayHistoryStack";
import { ResultStack } from "./ResultStack";
import { WithdrawMoneyStack } from "./WithdrawMoneyStack";
import CustomText from "../components/CustomText";
import { Image } from "react-native";
import { rh, rw } from "../utils/responsive";
import { Images } from "../utils/Images";
import { Colors } from "../utils/Colors";
import { useTranslation } from "../hooks/useTranslation";

const Tab = createBottomTabNavigator<BottomTabParamList>();

export const BottomTabs = () => {
    const { t } = useTranslation();
    return (
        <Tab.Navigator
            initialRouteName="HomeTab"
            screenOptions={{
                headerShown: false,
                tabBarStyle:{
                    backgroundColor: Colors.TAB_ACTIVE_BG
                }
            }}
        >
            <Tab.Screen
                name="HomeTab"
                component={HomeStack}
                options={{
                    tabBarLabel: ({ focused }) => (
                        <CustomText children={t('home_menu')} style={{ color: Colors.WHITE, fontSize: focused ? rh(1.6) : rh(1.4) }} />
                    ),
                    tabBarIcon: ({ focused }) => (
                        <Image
                            source={Images.HOME}
                            style={{
                                width: rw(focused?5:4),
                                height: rw(focused?5:4),
                                resizeMode: 'contain',
                                tintColor: Colors.WHITE,
                            }}
                        />
                    ),
                    headerShown: false
                }}
            />

            <Tab.Screen
                name="AddMoneyTab"
                component={AddMoneyStack}
                options={{
                    tabBarLabel: ({ focused }) => (
                        <CustomText children={t('add_money')} style={{ color: Colors.WHITE, fontSize: focused ? rh(1.6) : rh(1.4) }} />
                    ),
                    tabBarIcon: ({ focused }) => (
                        <Image
                            source={Images.ADD_MONEY}
                            style={{
                                width: rw(focused?5:4),
                                height: rw(focused?5:4),
                                resizeMode: 'contain',
                                tintColor: Colors.WHITE,
                            }}
                        />
                    ),
                    headerShown: false
                }}
                listeners={({ navigation }) => ({
                    tabPress: () => {
                        navigation.navigate("AddMoneyTab", {
                            screen: "AddMoney",
                        });
                    },
                })}
            />

            <Tab.Screen
                name="PlayHistoryTab"
                component={PlayHistoryStack}
                options={{
                    tabBarLabel: ({ focused }) => (
                        <CustomText children={t('play_history')} style={{ color: Colors.WHITE, fontSize: focused ? rh(1.6) : rh(1.4) }} />
                    ),
                    tabBarIcon: ({ focused }) => (
                        <Image
                            source={Images.HISTORY}
                            style={{
                                width: rw(focused?5:4),
                                height: rw(focused?5:4),
                                resizeMode: 'contain',
                                tintColor: Colors.WHITE,
                            }}
                        />
                    ),
                    headerShown: false
                }}
                listeners={({ navigation }) => ({
                    tabPress: () => {
                        navigation.navigate("PlayHistoryTab", {
                            screen: "PlayHistory",
                        });
                    },
                })}
            />

            <Tab.Screen
                name="ResultTab"
                component={ResultStack}
                options={{
                    tabBarLabel: ({ focused }) => (
                        <CustomText children={t('result_menu')} style={{ color: Colors.WHITE, fontSize: focused ? rh(1.6) : rh(1.4) }} />
                    ),
                    tabBarIcon: ({ focused }) => (
                        <Image
                            source={Images.RESULT}
                            style={{
                                width: rw(focused?5:4),
                                height: rw(focused?5:4),
                                resizeMode: 'contain',
                                tintColor: Colors.WHITE,
                            }}
                        />
                    ),
                    headerShown: false
                }}
                listeners={({ navigation }) => ({
                    tabPress: () => {
                        navigation.navigate("ResultTab", {
                            screen: "Result",
                        });
                    },
                })}
            />

            <Tab.Screen
                name="WithdrawMoneyTab"
                component={WithdrawMoneyStack}
                options={{
                    tabBarLabel: ({ focused }) => (
                        <CustomText children={t('withdraw_money')} style={{ color: Colors.WHITE, fontSize: focused ? rh(1.6) : rh(1.4) }} />
                    ),
                    tabBarIcon: ({ focused }) => (
                        <Image
                            source={Images.WITHDRAWAL}
                            style={{
                                width: rw(focused?5:4),
                                height: rw(focused?5:4),
                                resizeMode: 'contain',
                                tintColor: Colors.WHITE,
                            }}
                        />
                    ),
                    headerShown: false
                }}
                listeners={({ navigation }) => ({
                    tabPress: () => {
                        navigation.navigate("WithdrawMoneyTab", {
                            screen: "WithdrawMoney",
                        });
                    },
                })}
            />
        </Tab.Navigator>
    );
};
