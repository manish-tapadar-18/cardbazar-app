import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { PlayHistoryStackParamList } from "./RouteTypes.ts";
import {PlayHistory} from "../pages/PostAuth/index.ts"

const Stack = createNativeStackNavigator<PlayHistoryStackParamList>();

export const PlayHistoryStack = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="PlayHistory" component={PlayHistory} />
    </Stack.Navigator>
  );
};