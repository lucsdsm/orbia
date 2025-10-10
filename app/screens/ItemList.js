import React from "react";
import { View, StyleSheet } from "react-native";
import Itens from "../components/Items";
import { useTheme } from "../ThemeContext";

export default function ItensScreen() {
  const { colors } = useTheme();

  return (
    <View style={[styles.wrapper, { backgroundColor: colors.secondBackground }]}>
        <View style={[styles.container, { backgroundColor: colors.background }]}>
            <Itens /> 
        </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    justifyContent: "flex-end", 
  },
  container: {
    flex: 1,
    alignItems: "center",
    padding: 20,
    justifyContent: "center",
    marginTop: 60, 
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
});
