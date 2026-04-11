import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { AddMoneyStackParamList } from "./RouteTypes.ts";
import {AddMoney} from "../pages/PostAuth/index.ts"

const Stack = createNativeStackNavigator<AddMoneyStackParamList>();

export const AddMoneyStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="AddMoney" component={AddMoney} />
    </Stack.Navigator>
  );
};