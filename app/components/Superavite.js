import React, { useMemo } from "react";
import { View, Text, StyleSheet } from "react-native";
import { useTheme } from "../contexts/ThemeContext";

/**
 * Componente que exibe o superávite ou déficit com base nos itens fornecidos.
*/
export default function Superavite({ itens = [] }) { 
  const { colors } = useTheme();

  const saldoDoMes = useMemo(() => {
    let receita = 0;
    let despesa = 0;

    if (!Array.isArray(itens)) return 0;

    itens.forEach(item => {
      const valor = Number(item.valor) || 0;
      if (item.natureza === "receita") receita += valor;
      else if (item.natureza === "despesa") despesa += valor;
    });

    return receita - despesa;
  }, [itens]);

  const positivo = parseFloat(saldoDoMes) >= 0;

  return (
    <View style={styles.container}>
      <Text style={[styles.label, { color: colors.text }]}> {positivo ? "Superávite" : "Déficit"} </Text>
      <Text style={[styles.valor, { color: positivo ? "#4CAF50" : "#F44336" }]}>
      {positivo ? "+ " : "- "} R$ {Math.abs(saldoDoMes).toFixed(2)}
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