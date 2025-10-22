import "react-native-reanimated";
import "react-native-gesture-handler";

import React from "react";

import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator, CardStyleInterpolators } from "@react-navigation/stack";

import { ThemeProvider } from "./contexts/ThemeContext";
import { ItensProvider } from "./contexts/ItensContext";
import { CartoesProvider } from "./contexts/CartoesContext";

import Toast from "react-native-toast-message";

import Navigator from "./components/Navigator";
import ItemAdd from "./screens/ItemAdd";
import ItemEdit from "./screens/ItemEdit";
import CardList from "./screens/CardList";
import CardAdd from "./screens/CardAdd";
import CardEdit from "./screens/CardEdit";

const Stack = createStackNavigator();

export default function App() {
  return (
    <ThemeProvider>
      <CartoesProvider>
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
              <Stack.Screen name="CardList" component={CardList} />
              <Stack.Screen name="CardAdd" component={CardAdd} />
              <Stack.Screen name="CardEdit" component={CardEdit} />
            </Stack.Navigator>
            <Toast 
              topOffset={60}
              visibilityTime={2000}
              autoHide={true}
            />
          </NavigationContainer>
        </ItensProvider>
      </CartoesProvider>
    </ThemeProvider>
  );
}
