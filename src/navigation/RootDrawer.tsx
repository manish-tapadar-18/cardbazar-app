import { createDrawerNavigator } from "@react-navigation/drawer";
import { DrawerParamList } from "./RouteTypes";
import CustomDrawerContent from "../components/CustomDrawerContent";
import { BottomTabs } from "./BottomTabs";
import CommonHeader from "../components/CommonHeader";
import { useUserStore } from "../stores/userStore";
import { useAdminDetailsStore } from "../stores/adminDetailsStore";
import { Alert, Linking } from "react-native";
import { useCallback, useEffect } from "react";
import { Repository } from "../repository/Repository";
import { useWalletStore } from "../stores/walletStore";

const Drawer = createDrawerNavigator<DrawerParamList>();

export const RootDrawer = () => {
    
    const { adminDetails } = useAdminDetailsStore();
    const { balance } = useWalletStore();

    
    return (
        <Drawer.Navigator
            screenOptions={{
                headerShown: true,
                drawerAllowFontScaling: false,
                drawerType: "back",
                header: ({ navigation }) => {
                    return <CommonHeader
                        balance={balance}
                        onWhatsappPress={() => {
                            let number = adminDetails?.WHATSAPP_NUMBER;
                            let url = "whatsapp://send?text=''&phone=91" + number;
                            Linking.openURL(url)
                                .then(() => {
                                    // console.log("WhatsApp Opened successfully " + data);  //<---Success
                                })
                                .catch(() => {
                                    Alert.alert("Whatsapp Error", "Make sure WhatsApp installed on your device");  //<---Error
                                });
                        }}
                        onPhonePress={() => {
                            let number = adminDetails?.MOBILE;
                            number = `tel:${number}`;
                            Linking.openURL(number);
                        }}
                        onMenuPress={() => navigation.toggleDrawer()}
                    />;
                }
            }}
            drawerContent={(props) => <CustomDrawerContent {...props} />}

        >
            <Drawer.Screen name="MainTabs" component={BottomTabs} />
        </Drawer.Navigator>
    );
};