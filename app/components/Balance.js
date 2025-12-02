import React, { useState, useEffect } from "react";
import { View, Text, TextInput, StyleSheet, TouchableOpacity } from "react-native";
import { useTheme } from "../contexts/ThemeContext";
import { useFocusEffect } from "@react-navigation/native";
import { useSaldo } from "../contexts/SaldoContext";

/**
 * Componente para exibição e edição do saldo.
*/
export default function Balance({ onSaldoChange }) {
  const { colors } = useTheme();
  const { saldo: saldoContext, atualizarSaldo, loading } = useSaldo();
  const [saldo, setSaldo] = useState("0.00");
  const [editando, setEditando] = useState(false);

  // atualiza o estado local quando o saldo do contexto muda
  useEffect(() => {
    if (!loading) {
      const valorFormatado = saldoContext.toFixed(2);
      setSaldo(valorFormatado);
      if (onSaldoChange) {
        onSaldoChange(saldoContext);
      }
    }
  }, [saldoContext, loading]);

  // recarrega quando a tela ganhar foco
  useFocusEffect(
    React.useCallback(() => {
      if (!loading) {
        const valorFormatado = saldoContext.toFixed(2);
        setSaldo(valorFormatado);
        if (onSaldoChange) {
          onSaldoChange(saldoContext);
        }
      }
    }, [saldoContext, loading])
  );

  const salvarSaldo = async (valor) => {
    try {
      await atualizarSaldo(valor);
      if (onSaldoChange) {
        onSaldoChange(valor);
      }
    } catch (error) {
      console.error("Erro ao salvar saldo:", error);
    }
  };

  const handlePress = () => setEditando(true);

  const handleChange = (texto) => {
    const valor = texto.replace(/[^0-9.]/g, "");

    if (valor.split(".").length > 2) return;

    setSaldo(valor);
  };

  const handleSubmit = () => {
    let valor = parseFloat(saldo);
    if (isNaN(valor) || valor < 0) {
      valor = 0;
    }
    
    const valorFormatado = valor.toFixed(2);
    setSaldo(valorFormatado);
    salvarSaldo(valor);
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