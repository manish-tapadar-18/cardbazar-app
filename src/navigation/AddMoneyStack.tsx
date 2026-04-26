import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { AddMoneyStackParamList } from "./RouteTypes.ts";
import {AddMoney} from "../pages/PostAuth/index.ts"
import PaymentSelection from "../pages/PostAuth/PaymentSelection/PaymentSelection.tsx";

const Stack = createNativeStackNavigator<AddMoneyStackParamList>();

export const AddMoneyStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="AddMoney" component={AddMoney} />
      <Stack.Screen name="PaymentSelection" component={PaymentSelection} />
    </Stack.Navigator>
  );
};