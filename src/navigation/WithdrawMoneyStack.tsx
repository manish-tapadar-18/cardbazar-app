import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { WithdrawMoneyStackParamList } from "./RouteTypes.ts";
import Withdraw from "../pages/PostAuth/WithDraw/Withdraw.tsx";

const Stack = createNativeStackNavigator<WithdrawMoneyStackParamList>();

export const WithdrawMoneyStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="WithdrawMoney" component={Withdraw} />
    </Stack.Navigator>
  );
};
