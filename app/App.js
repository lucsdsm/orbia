import React from "react";
import { View, StyleSheet } from "react-native";

import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator, CardStyleInterpolators } from "@react-navigation/stack"; // ✅ De @react-navigation/stack!

import { ThemeProvider, useTheme } from "./ThemeContext";

import Header from "./components/Header";
import Saldo from "./components/Saldo";
import Footer from "./components/Footer";

import ItemAdd from "./screens/ItemAdd";
import ItemList from "./screens/ItemList";

const Stack = createStackNavigator();

function HomeScreen() {
  const { colors } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Header />
      <Saldo />
      <Footer />
    </View>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <NavigationContainer>
        <Stack.Navigator
          screenOptions={{
            headerShown: false,
            gestureEnabled: true,
            cardStyleInterpolator: CardStyleInterpolators.forVerticalIOS,
          }}>
          <Stack.Screen name="Home" component={HomeScreen} />
          <Stack.Screen 
            name="ItemAdd" 
            component={ItemAdd}
          />
          <Stack.Screen 
            name="ItemList" 
            component={ItemList}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "space-between",
  },
});