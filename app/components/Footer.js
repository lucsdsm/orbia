import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useTheme } from "../ThemeContext";

export default function Footer() {
  const { toggleTheme, isDark, colors } = useTheme();

  return (
    <View style={[styles.footer, { backgroundColor: colors.card }]}>
      <View style={styles.iconRow}>
        {/* Botão de tema */}
        <TouchableOpacity
          style={[styles.button, { backgroundColor: "rgba(128,128,128,0.5)" }]}
          onPress={toggleTheme}
        >
          {isDark ? (
            <Feather name="sun" size={28} color={colors.text} />
          ) : (
            <Feather name="moon" size={28} color={colors.text} />
          )}
        </TouchableOpacity>

        {/* Botão de adicionar */}
        <TouchableOpacity
          style={[styles.button, { backgroundColor: colors.primary }]} 
          onPress={() => alert("Adicionar ação")}
        >
          <Feather name="plus" size={28} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  iconRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 15, // espaço entre os botões (ou usar marginRight se versão antiga RN)
  },
  
  footer: {
    position: "absolute",
    bottom: 25,
    left: 25,
    right: 25,
    padding: 5,
    borderRadius: 50,
    alignItems: "center",
  },
  button: {
    padding: 10,
    borderRadius: 360,
    backgroundColor: "hsla(0, 0%, 100%, 0.10)"
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
  },
});
