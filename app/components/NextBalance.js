import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { useTheme } from "../contexts/ThemeContext";

/**
 * Componente que exibe o saldo projetado para o próximo mês.
*/
export default function NextBalance({ saldoAtual = 0, superavite = 0 }) {
  const { colors } = useTheme();

  const saldoProximoMes = saldoAtual + superavite;
  const positivo = saldoProximoMes >= 0;

  return (
    <View style={styles.container}>
      <Text style={[styles.label, { color: colors.text }]}>
        Saldo do próximo mês
      </Text>
      <Text style={[styles.valor, { color: positivo ? "#4CAF50" : "#F44336" }]}>
        {positivo ? "+ " : "- "} R$ {Math.abs(saldoProximoMes).toFixed(2)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 20,
    alignItems: "center",
  },
  label: {
    fontSize: 16,
    fontWeight: "bold",
  },
  valor: {
    fontSize: 28,
    fontWeight: "bold",
    marginTop: 5,
  },
});