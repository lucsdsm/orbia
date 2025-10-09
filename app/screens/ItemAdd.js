import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from "react-native";
import { useTheme } from "../ThemeContext";

import AsyncStorage from '@react-native-async-storage/async-storage';

export default function CadastroScreen({ route, navigation }) {
  const { colors } = useTheme();
  const { tipo } = route.params; // "receita" ou "despesa"

  const [descricao, setDescricao] = useState("");
  const [valor, setValor] = useState("");
  const [cartao, setCartao] = useState("");
  const [data, setData] = useState("");
  const [parcelas, setParcelas] = useState("");
  const [emoji, setEmoji] = useState("");

  const handleSalvar = async () => {
    if (!descricao || !emoji || !valor || !cartao || !data || !parcelas) {
      alert("Preencha todos os campos!");
      return;
    }

    try{
      const itensExistentes = await AsyncStorage.getItem("itens");
      const itens = itensExistentes ? JSON.parse(itensExistentes) : [];

      const novoItem = {
        id: Date.now().toString(),
        tipo,
        descricao,
        emoji,
        valor: parseFloat(valor),
        cartao,
        data,
        parcelas: parseInt(parcelas),
      };

      await AsyncStorage.setItem("itens", JSON.stringify([...itens, novoItem]));

      alert("Item salvo com sucesso!");
      navigation.goBack();
      
    } 
    
    catch (error) {
      alert("Erro ao salvar o item.");
      console.error(error);
    }

  };

  const valorChange = (texto) => {
    // permite apenas números e ponto
    const novoValor = texto.replace(/[^0-9.]/g, "");

    // evita múltiplos pontos
    if (novoValor.split(".").length > 2) return;

    setValor(novoValor);
  };

  const valorSubmit = () => {
    let valorNumerico = parseFloat(valor);
    if (isNaN(valorNumerico) || valorNumerico < 0) {
      valorNumerico = 0;
    }
    setValor(valorNumerico.toFixed(2));
  };

  const dateChange = (texto) => {
    let novoTexto = texto.replace(/[^0-9]/g, "");

    if (novoTexto.length > 8) novoTexto = novoTexto.slice(0, 8);

    if (novoTexto.length > 2) {
      novoTexto = novoTexto.slice(0, 2) + "/" + novoTexto.slice(2);
    }

    if (novoTexto.length > 5) {
      novoTexto = novoTexto.slice(0, 5) + "/" + novoTexto.slice(5);
    }

    setData(novoTexto);
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
        placeholder="Valor em R$"
        placeholderTextColor="#888"
        keyboardType="numeric"
        value={valor}
        onChangeText={valorChange}
        onBlur={valorSubmit}
        onSubmitEditing={valorSubmit}
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
        keyboardType="numeric"
        onChangeText={dateChange}
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
    justifyContent: "flex-start",
    marginBlockStart: 60,
    borderRadius: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 20,
  },
  input: {
    borderWidth: 0,
    borderRadius: 10,
    padding: 20,
    marginBottom: 15,
  },
  button: {
    padding: 12,
    borderRadius: 10,
    alignItems: "center",
  },
});
