// App root wires providers, session state, toast overlay, and navigation.
// The native splash is hidden on the overlay's first layout (ref guard);
// the overlay unmounts after fading out, so nothing blocks the app after.
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { CONFIG_ERROR } from './src/config/env';
import { ConfigErrorScreen } from './src/screens/ConfigErrorScreen';
import { OfflineProvider } from './src/context/OfflineContext';
import { AuthProvider } from './src/context/AuthContext';
import { ToastProvider } from './src/context/ToastContext';
import { RootNavigator } from './src/navigation/RootNavigator';
import { SplashGate } from './src/components/splash/SplashGate';

SplashScreen.preventAutoHideAsync();

export default function App() {
  if (CONFIG_ERROR) {
    SplashScreen.hide();
    return (
      <SafeAreaProvider>
        <OfflineProvider>
          <ConfigErrorScreen />
        </OfflineProvider>
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <OfflineProvider>
        <AuthProvider>
          <SplashGate>
            <ToastProvider>
              <StatusBar style="dark" />
              <RootNavigator />
            </ToastProvider>
          </SplashGate>
        </AuthProvider>
      </OfflineProvider>
    </SafeAreaProvider>
  );
}
