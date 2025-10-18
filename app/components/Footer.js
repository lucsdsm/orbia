import React, { useState } from "react";
import { View, TouchableOpacity, StyleSheet } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useTheme } from "../ThemeContext";
import { useNavigation } from "@react-navigation/native";
import Modal from "./Modal";

export default function Footer( { onNovoItem } ) {
  const { toggleTheme, isDark, colors } = useTheme();
  const navigation = useNavigation();
  const [menuVisible, setMenuVisible] = useState(false);

  return (
    <>
      <View style={[styles.footer, { backgroundColor: colors.background }]}>
        <View style={styles.iconRow}>
          {/* botão home */}
          <TouchableOpacity
            style={[styles.button, { backgroundColor: "rgba(128,128,128,0.5)" }]}
            onPress={() => navigation.navigate("Drawer", { screen: "Início" })}
          >
            <Feather name="home" size={28} color={colors.text} />
          </TouchableOpacity>

          {/* botão de adicionar receita */}
          <TouchableOpacity
            style={[styles.button, { backgroundColor: "#4CAF50" }]}
            onPress={() => onNovoItem("receita")}
          >
            <Feather name="arrow-up-circle" size={28} color="#fff" />
          </TouchableOpacity>

          {/* botão de adicionar despesa */}
          <TouchableOpacity
            style={[styles.button, { backgroundColor: "#F44336" }]}
            onPress={() => onNovoItem("despesa")}
          >
            <Feather name="arrow-down-circle" size={28} color="#fff" />
          </TouchableOpacity>

          {/* botão de tema */}
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

          {/* botão menu sanduíche */}
          <TouchableOpacity
            style={[styles.button, { backgroundColor: "rgba(128,128,128,0.5)" }]}
            onPress={() => setMenuVisible(true)}
          >
            <Feather name="menu" size={28} color={colors.text} />
          </TouchableOpacity>
        </View>
      </View>

      <Modal 
        visible={menuVisible} 
        onClose={() => setMenuVisible(false)} 
      />
    </>
  );
}

const styles = StyleSheet.create({
  iconRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 15,
  },
  
  footer: {
    margin: 25,
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
