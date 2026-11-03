// App root wires safe area, session state, toast overlay, and navigation.
// Falls back to a full-screen configuration error when setup is incomplete.
// The native splash stays visible until AuthContext confirms the session.
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { CONFIG_ERROR } from './src/config/env';
import { ConfigErrorScreen } from './src/screens/ConfigErrorScreen';
import { AuthProvider } from './src/context/AuthContext';
import { ToastProvider } from './src/context/ToastContext';
import { RootNavigator } from './src/navigation/RootNavigator';

// Keep the native splash visible until the login is restored and checked.
SplashScreen.preventAutoHideAsync();

export default function App() {
  if (CONFIG_ERROR) {
    SplashScreen.hide();
    return (
      <SafeAreaProvider>
        <ConfigErrorScreen />
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <AuthProvider>
        <ToastProvider>
          <StatusBar style="dark" />
          <RootNavigator />
        </ToastProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
