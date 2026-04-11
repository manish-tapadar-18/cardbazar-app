import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { ResultStackParamList } from "./RouteTypes.ts";
import Result from "../pages/PostAuth/Result/Result.tsx";

const Stack = createNativeStackNavigator<ResultStackParamList>();

export const ResultStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Result" component={Result} />
    </Stack.Navigator>
  );
};