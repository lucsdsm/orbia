import React from "react";
import { View, StyleSheet } from "react-native";

import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator, CardStyleInterpolators } from "@react-navigation/native-stack";

import { ThemeProvider, useTheme } from "./ThemeContext";

import Header from "./components/Header";
import Saldo from "./components/Saldo";
import Footer from "./components/Footer";
import Itens from "./components/Itens";

import ItemAdd from "./screens/ItemAdd";

const Stack = createNativeStackNavigator();

function HomeScreen() {
  const { colors } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Header />
      <Saldo />
      <Itens />
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
            presentation: 'modal',
            animation: 'slide_from_bottom', 
          }}
        >
          <Stack.Screen name="Home" component={HomeScreen} />
          <Stack.Screen name="ItemAdd" component={ItemAdd} />
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
