import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from "react-native";
import { useTheme } from "../ThemeContext";

export default function CadastroScreen({ route, navigation }) {
  const { colors } = useTheme();
  const { tipo } = route.params; // "receita" ou "despesa"

  const [descricao, setDescricao] = useState("");
  const [valor, setValor] = useState("");
  const [cartao, setCartao] = useState("");
  const [data, setData] = useState("");
  const [parcelas, setParcelas] = useState("");
  const [emoji, setEmoji] = useState("");

  const handleSalvar = () => {
    if (!descricao || !valor) {
      alert("Preencha a descrição e o valor!");
      return;
    }

    // Aqui você salvaria no banco futuramente
    console.log({ descricao, valor, cartao, data, parcelas, tipo });
    alert(`${tipo === "receita" ? "Receita" : "Despesa"} cadastrada com sucesso!`);
    navigation.goBack();
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.title, { color: colors.text }]}>
        + {tipo === "receita" ? "Receita" : "Despesa"}
      </Text>

      <TextInput
        style={[styles.input, { borderColor: colors.text, color: colors.text }]}
        placeholder="Descrição"
        placeholderTextColor="#888"
        value={descricao}
        onChangeText={setDescricao}
      />
      <TextInput
        style={[styles.input, { borderColor: colors.text, color: colors.text }]}
        placeholder="Emoji"
        placeholderTextColor="#888"
        value={emoji}
        onChangeText={setEmoji}
      />
      <TextInput
        style={[styles.input, { borderColor: colors.text, color: colors.text }]}
        placeholder="Valor"
        placeholderTextColor="#888"
        keyboardType="numeric"
        value={valor}
        onChangeText={setValor}
      />
      <TextInput
        style={[styles.input, { borderColor: colors.text, color: colors.text }]}
        placeholder="Cartão"
        placeholderTextColor="#888"
        value={cartao}
        onChangeText={setCartao}
      />
      <TextInput
        style={[styles.input, { borderColor: colors.text, color: colors.text }]}
        placeholder="Data da compra"
        placeholderTextColor="#888"
        value={data}
        onChangeText={setData}
      />
      <TextInput
        style={[styles.input, { borderColor: colors.text, color: colors.text }]}
        placeholder="Nº de parcelas"
        placeholderTextColor="#888"
        keyboardType="numeric"
        value={parcelas}
        onChangeText={setParcelas}
      />

      <TouchableOpacity
        style={[styles.button, { backgroundColor: colors.text }]}
        onPress={handleSalvar}
      >
        <Text style={{ color: colors.background, fontWeight: "bold" }}>
          Salvar
        </Text>
      </TouchableOpacity>

      {/* botão para voltar */}
      <TouchableOpacity onPress={() => navigation.goBack()} style={[styles.button, { backgroundColor: colors.text, marginTop: 10 }]}>
        <Text style={{ color: colors.background, fontWeight: "bold" }}> Voltar </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: "center",
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
    marginBottom: 15,
  },
  button: {
    padding: 12,
    borderRadius: 10,
    alignItems: "center",
  },
});
