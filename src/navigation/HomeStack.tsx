import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { HomeStackParamList } from "./RouteTypes.ts";
import {Home,Account,GameRules,GameTimings,LanguageOptions,Refer,TransactionHistory, AddMoney} from "../pages/PostAuth/index.ts"
import ShareApp from "../pages/PostAuth/ShareApp/ShareApp.tsx";
import GameDetails from "../pages/PostAuth/GameDetails/GameDetails.tsx";

const Stack = createNativeStackNavigator<HomeStackParamList>();

export const HomeStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Home" component={Home} />
      <Stack.Screen name="GameDetails" component={GameDetails} />
      <Stack.Screen name="AddMoney" component={AddMoney} />
      <Stack.Screen name="Account" component={Account} />
      <Stack.Screen name="GameRules" component={GameRules} />
      <Stack.Screen name="GameTimings" component={GameTimings} />
      <Stack.Screen name="LanguageOptions" component={LanguageOptions} />
      <Stack.Screen name="Refer" component={Refer} />
      <Stack.Screen name="TransactionHistory" component={TransactionHistory} />
      <Stack.Screen name="ShareApp" component={ShareApp} />
    </Stack.Navigator>
  );
};