import "react-native-reanimated";
import "react-native-gesture-handler";

import React from "react";

import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator, CardStyleInterpolators } from "@react-navigation/stack";

import { ThemeProvider } from "./ThemeContext";
import { ItensProvider } from "./ItensContext";

import Toast from "react-native-toast-message";

import Navigator from "./components/Navigator";
import ItemAdd from "./screens/ItemAdd";
import ItemEdit from "./screens/ItemEdit";

const Stack = createStackNavigator();

export default function App() {
  return (
    <ThemeProvider>
      <ItensProvider>
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
                presentation: "Sandwich",
                animation: "slide_from_bottom",
              }}
            />
          </Stack.Navigator>
          <Toast 
            topOffset={60}
            visibilityTime={2000}
            autoHide={true}
          />
        </NavigationContainer>
      </ItensProvider>
    </ThemeProvider>
  );
}
