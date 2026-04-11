import * as React from 'react';
import { NavigationContainer } from '@react-navigation/native';
// import BootSplash from "react-native-bootsplash";
import { ToastProvider } from 'react-native-toast-notifications';
import ToastInitializer from './src/components/ToastInitializer';
import AppNavigator from './src/navigation/AppNavigator';


export default function App() {
  return (
    <ToastProvider
      placement="top"
      duration={3000}
      animationType="slide-in"
    >
      <ToastInitializer />
      <NavigationContainer 
        // onReady={async () => await BootSplash.hide({ fade: true })}
      >
        <AppNavigator />
      </NavigationContainer>
    </ToastProvider>

  );
}