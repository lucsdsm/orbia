import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { ThemeProvider, useTheme } from "./ThemeContext";
import Header from "./components/Header";
import Home from "./components/Home";
import Footer from "./components/Footer";

function AppContent() {
  const { colors } = useTheme();
  
  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Header />
      <Home />
      <Footer />
    </View>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  homeContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
});
