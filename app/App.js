import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { ThemeProvider, useTheme } from "./ThemeContext";
import Saldo from "./components/Saldo";
import Footer from "./components/Footer";

function HomeScreen() {
  const { colors } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Saldo />
    </View>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <HomeScreen />
      <Footer />
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
