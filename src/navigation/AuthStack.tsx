import { createNativeStackNavigator } from "@react-navigation/native-stack";
import Splash from "../pages/splash/Splash";
import { AuthStackParamList } from "../types/NavigationStack";
import Authentication from "../pages/Auth/Authentication";

const Stack = createNativeStackNavigator<AuthStackParamList>();

function AuthStack() {
  return (
    <Stack.Navigator screenOptions={{headerShown:false}}>
      <Stack.Screen name="Splash" component={Splash} />
      <Stack.Screen name="Authentication" component={Authentication} />
    </Stack.Navigator>
  );
}

export default AuthStack;