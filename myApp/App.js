import { Stack } from 'expo-router';
import { NavigationContainer } from '@react-navigation/native';
import { Slot } from 'expo-router';
import { StatusBar } from 'expo-status-bar';

export default function App() {
  return (
    <>
      <StatusBar style="auto" />
      <NavigationContainer>
        <Stack>
          <Stack.Screen 
            name="index" 
            options={{ 
              title: 'Zihinsel Sağlık Takip',
              headerStyle: {
                backgroundColor: '#6a5acd',
              },
              headerTintColor: '#fff',
            }} 
          />
          <Stack.Screen 
            name="login" 
            options={{ 
              title: 'Giriş Yap',
              headerStyle: {
                backgroundColor: '#6a5acd',
              },
              headerTintColor: '#fff',
            }} 
          />
        </Stack>
      </NavigationContainer>
      <Slot />
    </>
  );
} 