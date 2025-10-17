import "react-native-reanimated";
import "react-native-gesture-handler";

import React from "react";

import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator, CardStyleInterpolators } from "@react-navigation/stack";

import { ThemeProvider, useTheme } from "./ThemeContext";
import { ItensProvider, useItens } from "./ItensContext";

import Toast from "react-native-toast-message";

import Navigator from "./components/Navigator";
import ItemAdd from "./screens/ItemAdd";
import ItemEdit from "./screens/ItemEdit";
import LoadingScreen from "./components/LoadingScreen";

const Stack = createStackNavigator();

function AppContent() {
  const { loading: loadingItens } = useItens();
  const { loading: loadingTheme } = useTheme();

  if (loadingItens || loadingTheme) {
    return <LoadingScreen />;
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          cardStyleInterpolator: CardStyleInterpolators.forVerticalIOS,
        }}>
        {/* O Drawer é a primeira camada */}
        <Stack.Screen name="Drawer" component={Navigator} />
        <Stack.Screen name="ItemAdd" component={ItemAdd} />
        <Stack.Screen
          name="ItemEdit"
          component={ItemEdit}
          options={{
            presentation: "modal",
            animation: "slide_from_bottom",
          }}
        />
      </Stack.Navigator>
      <Toast />
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <ItensProvider>
        <AppContent />
      </ItensProvider>
    </ThemeProvider>
  );
}
