import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from "react-native";
import { useTheme } from "../ThemeContext";

import Toast from "react-native-toast-message";

import AsyncStorage from '@react-native-async-storage/async-storage';

import { Picker } from "@react-native-picker/picker";

export default function CadastroScreen({ route, navigation }) {
  const { colors } = useTheme();
  const { natureza } = route.params; 

  const [descricao, setDescricao] = useState("");
  const [emoji, setEmoji] = useState("");
  const [valor, setValor] = useState("");
  const [tipo, setTipo] = useState("Fixa");
  const [cartao, setCartao] = useState("");
  const [data, setData] = useState("");
  const [parcelas, setParcelas] = useState("");
  
  const handleSalvar = async () => {
    if (!descricao || !emoji || !valor) {
      Toast.show({
        type: "error",
        text1: "Campos obrigatórios!",
        text2: "Preencha todos os campos antes de salvar.",
        position: "top",
        visibilityTime: 3000,
      });
      return;
    }

    try {
      const itensExistentes = await AsyncStorage.getItem("itens");
      const itens = itensExistentes ? JSON.parse(itensExistentes) : [];

      const novoItem = {
        id: Date.now().toString(),
        natureza,
        descricao,
        emoji,
        valor: parseFloat(valor),
        tipo,
        cartao,
        data,
        parcelas: parseInt(parcelas) || 0,
      };

      const novosItens = [...itens, novoItem];
      await AsyncStorage.setItem("itens", JSON.stringify(novosItens));

      Toast.show({
        type: "success",
        text1: "Item salvo com sucesso!",
        position: "top",
        visibilityTime: 3000,
      });

      setTimeout(() => {
        navigation.goBack();
      }, 300);
    }
    catch (error) {
      Toast.show({
        type: "error",
        text1: "Erro ao salvar o item.",
        position: "top",
        visibilityTime: 3000,
      });
      console.error(error);
    }
  };

  const valorChange = (texto) => {
    const novoValor = texto.replace(/[^0-9.]/g, "");
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
    <View style={[styles.wrapper, { backgroundColor: colors.secondBackground }]}>
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={[styles.title, { color: colors.text }]}>
          + {natureza === "Receita" ? "Receita" : "Despesa"}
        </Text>

        <TextInput
          style={[styles.input, { borderColor: colors.text, color: colors.text }]}
          placeholder="Descrição (*)"
          placeholderTextColor="#888"
          value={descricao}
          onChangeText={setDescricao}
        />

        <TextInput
          style={[styles.input, { borderColor: colors.text, color: colors.text }]}
          placeholder="Emoji (*)"
          placeholderTextColor="#888"
          value={emoji}
          onChangeText={setEmoji}
        />

        <TextInput
          style={[styles.input, { borderColor: colors.text, color: colors.text }]}
          placeholder="Valor em R$ (*)"
          placeholderTextColor="#888"
          keyboardType="numeric"
          value={valor}
          onChangeText={valorChange}
          onBlur={valorSubmit}
          onSubmitEditing={valorSubmit}
        />

        {natureza === "Despesa" && (
          <View style={[styles.pickerContainer, { borderColor: colors.text }]}>
            <Picker
              selectedValue={tipo}
              onValueChange={(itemValue) => setTipo(itemValue)}
              dropdownIconColor={colors.text}
              style={[styles.picker, { color: colors.text }]}
            >
              <Picker.Item label="Fixa" value="Fixa" />
              <Picker.Item label="Parcelada" value="Parcelada" />
            </Picker>
          </View>
        )}

        {tipo === "Parcelada" && (
          <TextInput
            style={[styles.input, { borderColor: colors.text, color: colors.text }]}
            placeholder="Cartão (*)"
            placeholderTextColor="#888"
            value={cartao}
            onChangeText={setCartao}
          />
        )}

        {natureza === "Despesa" && tipo === "Parcelada" && (
          <TextInput
            style={[styles.input, { borderColor: colors.text, color: colors.text }]}
            placeholder="Data da compra"
            placeholderTextColor="#888"
            value={data}
            keyboardType="numeric"
            onChangeText={dateChange}
          />
        )}

        {tipo === "Parcelada" && (
          <TextInput
            style={[styles.input, { borderColor: colors.text, color: colors.text }]}
            placeholder="Nº de parcelas"
            placeholderTextColor="#888"
            keyboardType="numeric"
            value={parcelas}
            onChangeText={setParcelas}
          />
        )}

        <TouchableOpacity
          style={[styles.button, { backgroundColor: colors.text }]}
          onPress={handleSalvar}
        >
          <Text style={{ color: colors.background, fontWeight: "bold" }}>
            Salvar
          </Text>
        </TouchableOpacity>

        <TouchableOpacity 
          onPress={() => navigation.goBack()} 
          style={[styles.button, { backgroundColor: colors.text, marginTop: 10 }]}
        >
          <Text style={{ color: colors.background, fontWeight: "bold" }}>Voltar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    flex: 1,
    justifyContent: "flex-end",
  },
  container: {
    flex: 1,
    padding: 20,
    justifyContent: "flex-start",
    marginBlockStart: 60,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
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
  picker: {
    height: 60,
    borderWidth: 0,
    borderRadius: 10,
    marginBottom: 15,
    marginLeft: 10,
    marginRight: 10,
  },
  pickerContainer: {
    borderRadius: 10,
    marginBottom: 15,
  },
});