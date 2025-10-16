import React from "react";
import { View, TextInput, TouchableOpacity, StyleSheet } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useTheme } from "../ThemeContext";

export default function DataCompraInput({ data, setData, dateChange, natureza, tipo }) {
  const { colors } = useTheme();

  const handleSetHoje = () => {
    const hoje = new Date();
    const dia = String(hoje.getDate()).padStart(2, "0");
    const mes = String(hoje.getMonth() + 1).padStart(2, "0");
    const ano = hoje.getFullYear();
    const dataFormatada = `${dia}/${mes}/${ano}`;
    setData(dataFormatada);
  };

  if (!(natureza === "despesa" && tipo === "parcelada")) return null;

  return (
    <View style={[styles.container, { borderColor: colors.text }]}>
      <TextInput
        style={[styles.input, { color: colors.text }]}
        placeholder="Data da compra"
        placeholderTextColor="#888"
        value={data}
        keyboardType="numeric"
        onChangeText={dateChange}
      />
      <TouchableOpacity onPress={handleSetHoje}>
        <Feather name="calendar" size={20} color={colors.text} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 15,
    padding: 20,
  },
  input: {
    flex: 1,
    height: 40,
  },
});
