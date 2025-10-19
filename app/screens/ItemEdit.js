import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from "react-native";
import { useTheme } from "../ThemeContext";
import Toast from "react-native-toast-message";
import { Picker } from "@react-native-picker/picker";
import { MaterialIcons } from "@expo/vector-icons";

import { CARDS } from "../constants";
import ActualDateInput from "../components/ActualDateInput";

import { StorageService } from "../services/storage";

export default function ItemEdit({ route, navigation }) {
  const { colors } = useTheme();
  const { item, onEdit } = route.params;

  const [descricao, setDescricao] = useState(item.descricao);
  const [emoji, setEmoji] = useState(item.emoji);
  const [valor, setValor] = useState(item.valor.toString());
  const [tipo, setTipo] = useState(item.tipo || "fixa");
  const [cartao, setCartao] = useState(item.cartao || "");
  const [data, setData] = useState(item.data || "");
  const [parcelas, setParcelas] = useState(item.parcelas?.toString() || "");

  const handleSalvar = async () => {
    if (!descricao || !emoji || !valor) {
      Toast.show({
        type: "error",
        text1: "Campos obrigatórios!",
        text2: "Preencha descrição, emoji e valor antes de salvar.",
        position: "top",
        visibilityTime: 3000,
      });
      return;
    }

    if (tipo === "parcelada" && (!cartao || !data || !parcelas)) {
      Toast.show({
        type: "error",
        text1: "Campos obrigatórios!",
        text2: "Preencha cartão, data e parcelas para despesas parceladas.",
        position: "top",
        visibilityTime: 3000,
      });
      return;
    }

    try {
      const itemEditado = {
        ...item,          
        descricao,
        emoji,
        valor: parseFloat(valor),
        tipo,
        cartao,
        data,
        parcelas: parseInt(parcelas) || 0,
      };

      await StorageService.updateItem(itemEditado.id, itemEditado);

      if (onEdit) onEdit(itemEditado);

      Toast.show({
        type: "success",
        text1: "Item atualizado!",
      });

      console.log("Item editado de:", item, "\npara:", itemEditado);

      navigation.goBack();
    } 
    catch (error) {
      console.error(error);
      Toast.show({
        type: "error",
        text1: "Erro ao salvar item.",
      });
    }
  };

  const valorChange = texto => {
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

  const dateChange = texto => {
    let novoTexto = texto.replace(/[^0-9]/g, "");
    if (novoTexto.length > 8) novoTexto = novoTexto.slice(0, 8);
    if (novoTexto.length > 2) novoTexto = novoTexto.slice(0, 2) + "/" + novoTexto.slice(2);
    if (novoTexto.length > 5) novoTexto = novoTexto.slice(0, 5) + "/" + novoTexto.slice(5);
    setData(novoTexto);
  };

  return (
    <View style={[styles.wrapper, { backgroundColor: colors.secondBackground }]}>
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={[styles.title, { color: colors.text }]}>Editar Item</Text>

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

        {item.natureza === "despesa" && (
          <View style={[styles.pickerContainer, { borderColor: colors.text, backgroundColor: colors.background }]}>
            <Picker
              selectedValue={tipo}
              onValueChange={(itemValue) => {
                setTipo(itemValue);
                if (itemValue === "parcelada") {
                  setCartao("nubank");
                } else {
                  setCartao("");
                }
                if (itemValue === "fixa") {
                  setData("");
                  setParcelas("");
                }
              }}
              // quando o picker for carregado, o valor inicial será vazio
              onLayout={() => {
                setCartao("");
              }}

              dropdownIconColor={colors.text}
              style={[
                styles.picker,
                {
                  color: colors.text,
                },
              ]}
              itemStyle={{
                color: colors.text,
              }}
            >
              <Picker.Item label="Fixa" value="fixa" />
              <Picker.Item label="Parcelada" value="parcelada" />
            </Picker>
          </View>
        )}

        <TextInput
          style={[styles.input, { borderColor: colors.text, color: colors.text }]}
          placeholder={tipo === "fixa" ? "Valor (*)" : "Valor da parcela (*)"}
          placeholderTextColor="#888"
          keyboardType="numeric"
          value={valor}
          onChangeText={valorChange}
          onBlur={valorSubmit}
          onSubmitEditing={valorSubmit}
        />

        {tipo === "parcelada" && (
          <>
            <View style={[styles.pickerContainer, { borderColor: colors.text, backgroundColor: colors.background }]}>
              <Picker
                selectedValue={cartao}
                onValueChange={(itemValue) => setCartao(itemValue)}
                dropdownIconColor={colors.text}
                style={[styles.picker, { color: colors.text }]}
                itemStyle={{ color: colors.text }}
              >
                {CARDS.map((cartao) => (
                  <Picker.Item
                    key={cartao.value}
                    label={cartao.label}
                    value={cartao.value}
                  />
                ))}
              </Picker>
            </View>

            {item.natureza === "despesa" && (
              <ActualDateInput
                data={data}
                setData={setData}
                dateChange={dateChange}
                natureza={item.natureza}
                tipo={tipo}
              />
            )}
            
            <TextInput
              style={[styles.input, { borderColor: colors.text, color: colors.text }]}
              placeholder="Nº de parcelas"
              placeholderTextColor="#888"
              keyboardType="numeric"
              value={parcelas}
              onChangeText={setParcelas}
            />
          </>
        )}

        <TouchableOpacity
          style={[styles.button, { backgroundColor: colors.text }]}
          activeOpacity={0.7}
          onPress={handleSalvar}
        >
          <Text style={{ color: colors.background, fontWeight: "bold" }}>Salvar</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
          style={[styles.button, { backgroundColor: colors.text, marginTop: 10 }]}
        >
          <Text style={{ color: colors.background, fontWeight: "bold" }}>Voltar</Text>
        </TouchableOpacity>

        {/* botão para excluir item */}
        <TouchableOpacity
          onPress={() => {
            Toast.show({
              type: "error",
              text1: "Excluir item?",
              text2: "Toque novamente para confirmar.",
              position: "top",
              visibilityTime: 2500,
              onPress: () => {
                removerItem(item.id);
                Toast.hide();
              },
            });
          }}
          activeOpacity={0.7}
          style={[styles.button, { backgroundColor: "#F44336", color: colors.text, marginTop: 10 }]}
        >
          <Text style={{ color: colors.background, fontWeight: "bold" }}> Excluir item </Text>
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
    marginLeft: 12,
    marginRight: 10,
  },
  pickerContainer: {
    borderRadius: 10,
    marginBottom: 15,
  },
});