import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { BottomTabParamList } from "./RouteTypes";
import { HomeStack } from "./HomeStack";
import { AddMoneyStack } from "./AddMoneyStack";
import { PlayHistoryStack } from "./PlayHistoryStack";
import { ResultStack } from "./ResultStack";
import { WithdrawMoneyStack } from "./WithdrawMoneyStack";
import CustomText from "../components/CustomText";
import { Image, StyleSheet } from "react-native";
import LinearGradient from "react-native-linear-gradient";
import { rh, rw } from "../utils/responsive";
import { Images } from "../utils/Images";
import { Colors } from "../utils/Colors";
import { useTranslation } from "../hooks/useTranslation";

const TabBarBackground = () => (
    <LinearGradient
        colors={['#44004F','#260030']}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 0 }}
        style={StyleSheet.absoluteFill}
    />
);

const Tab = createBottomTabNavigator<BottomTabParamList>();

export const BottomTabs = () => {
    const { t } = useTranslation();
    return (
        <Tab.Navigator
            initialRouteName="HomeTab"
            screenOptions={{
                headerShown: false,
                tabBarBackground: () => <TabBarBackground />,
                tabBarStyle: {
                    backgroundColor: Colors.TRANSPARENT,
                    borderTopWidth: 0,
                    elevation: 0,
                },
            }}
        >
            <Tab.Screen
                name="HomeTab"
                component={HomeStack}
                options={{
                    tabBarLabel: () => (
                        <CustomText children={t('home_menu')} style={{ color: Colors.WHITE, fontSize: rh(1.2) }} />
                    ),
                    tabBarIcon: ({ focused }) => (
                        <Image
                            source={Images.HOME}
                            style={{
                                width: rw(focused?5.5:5.5),
                                height: rw(focused?5.5:5.2),
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
                    tabBarLabel: () => (
                        <CustomText children={t('add_money')} style={{ color: Colors.WHITE, fontSize: rh(1.2) }} />
                    ),
                    tabBarIcon: ({ focused }) => (
                        <Image
                            source={Images.ADD_MONEY}
                            style={{
                               width: rw(focused?5.5:5.5),
                                height: rw(focused?5.5:5.2),
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
                name="WithdrawMoneyTab"
                component={WithdrawMoneyStack}
                options={{
                    tabBarLabel: () => (
                        <CustomText children={t('withdraw_money')} style={{ color: Colors.WHITE, fontSize: rh(1.2) }} />
                    ),
                    tabBarIcon: ({ focused }) => (
                        <Image
                            source={Images.WITHDRAWAL}
                            style={{
                                width: rw(focused?5.5:5.5),
                                height: rw(focused?5.5:5.2),
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

            <Tab.Screen
                name="PlayHistoryTab"
                component={PlayHistoryStack}
                options={{
                    tabBarLabel: () => (
                        <CustomText children={t('play_history')} style={{ color: Colors.WHITE, fontSize: rh(1.2) }} />
                    ),
                    tabBarIcon: ({ focused }) => (
                        <Image
                            source={Images.HISTORY}
                            style={{
                                width: rw(focused?5.5:5.5),
                                height: rw(focused?5.5:5.2),
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
                    tabBarLabel: () => (
                        <CustomText children={t('result_menu')} style={{ color: Colors.WHITE, fontSize: rh(1.2) }} />
                    ),
                    tabBarIcon: ({ focused }) => (
                        <Image
                            source={Images.RESULT}
                            style={{
                                width: rw(focused?5.5:5.5),
                                height: rw(focused?5.5:5.2),
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

            
        </Tab.Navigator>
    );
};
