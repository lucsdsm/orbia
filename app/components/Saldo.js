import React, { useState } from "react";
import { View, Text, TextInput, StyleSheet, Pressable, TouchableOpacity } from "react-native";
import { useTheme } from "../ThemeContext";

export default function Saldo() {
  const { colors } = useTheme(); // importa as cores do tema
  const [saldo, setSaldo] = useState("0.00");
  const [editando, setEditando] = useState(false);

  const handlePress = () => setEditando(true);
  const handleChange = (texto) => setSaldo(texto);
  const handleSubmit = () => setEditando(false);

  return editando ? (
    <TextInput
      style={[
        styles.input,
        { color: colors.text, borderColor: colors.text },
      ]}
      value={saldo}
      onChangeText={handleChange}
      onSubmitEditing={handleSubmit}
      keyboardType="numeric"
      autoFocus
    />
  ) : (
    <TouchableOpacity onPress={handlePress}>
      <Text style={[styles.text, { color: colors.text }]}>Saldo</Text>
      <Text style={[styles.label, { color: colors.text }]}>R$ {saldo}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  text: {
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
  },
  label: {
    fontSize: 24,
    fontWeight: "bold",
    textAlign: "center",
  },
  input: {
    fontSize: 24,
    fontWeight: "bold",
    borderBottomWidth: 1,
    minWidth: 120,
    textAlign: "center",
  },
});
