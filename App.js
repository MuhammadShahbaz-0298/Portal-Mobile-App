// App root wires safe area, session state, toast overlay, and navigation.
// Falls back to a full-screen config error when EXPO_PUBLIC_API_URL is bad.
// The native splash stays visible until AuthContext confirms the session.
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { CONFIG_ERROR } from './src/config/env';
import { ConfigErrorScreen } from './src/screens/ConfigErrorScreen';
import { AuthProvider } from './src/context/AuthContext';
import { ToastProvider } from './src/context/ToastContext';
import { RootNavigator } from './src/navigation/RootNavigator';
import { ServerWakingBanner } from './src/components/ui/ServerWakingBanner';

// Keep the native splash visible until the login is restored and checked.
SplashScreen.preventAutoHideAsync();

export default function App() {
  if (CONFIG_ERROR) {
    SplashScreen.hide();
    return <ConfigErrorScreen />;
  }

  return (
    <SafeAreaProvider>
      <AuthProvider>
        <ToastProvider>
          <StatusBar style="dark" />
          <RootNavigator />
          <ServerWakingBanner />
        </ToastProvider>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
