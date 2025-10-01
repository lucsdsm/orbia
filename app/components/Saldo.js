import React, { useState } from "react";
import { View, Text, TextInput, StyleSheet, Pressable, TouchableOpacity } from "react-native";
import { useTheme } from "../ThemeContext";

export default function Saldo() {
  const { colors } = useTheme(); // importa as cores do tema
  const [saldo, setSaldo] = useState("0.00");
  const [editando, setEditando] = useState(false);

  const handlePress = () => setEditando(true); // ativa o modo de edição

  const handleChange = (texto) => {
    // permite apenas números e ponto
    const valor = texto.replace(/[^0-9.]/g, "");

    // evita valores negativos ou múltiplos pontos
    if (valor.split(".").length > 2) return;

    setSaldo(valor);
  };

  const handleSubmit = () => { // desativa o modo de edição
    let valor = parseFloat(saldo);
    if (isNaN(valor) || valor < 0) {
      valor = 0; // reseta para zero se for inválido
    }
    setSaldo(valor.toFixed(2)); // mantém sempre 2 casas decimais
    setEditando(false);
  }; 

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
