import React from 'react';
import { StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ItemProvider } from './src/context/ItemContext';
import { UserProvider } from './src/context/UserContext';
import AppNavigator from './src/navigation/AppNavigator';
import { COLORS } from './src/theme/colors';

export default function App() {
  return (
    <SafeAreaProvider>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.background} />
      <UserProvider>
        <ItemProvider>
          <AppNavigator />
        </ItemProvider>
      </UserProvider>
    </SafeAreaProvider>
  );
}
