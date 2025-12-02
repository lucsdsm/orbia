import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useTheme } from "../contexts/ThemeContext";
import { useCartoes } from "../contexts/CartoesContext";
import { useItens } from "../contexts/ItensContext";

import Toast from "react-native-toast-message";
import CustomPicker from "../components/CustomPicker";

import { MONTHS } from "../constants";

export default function ItemAdd({ route, navigation }) {
  const { colors } = useTheme();
  const { cartoes } = useCartoes();
  const { adicionarItem } = useItens();
  const { natureza } = route.params; 

  const [descricao, setDescricao] = useState("");
  const [emoji, setEmoji] = useState("");
  const [valor, setValor] = useState("");
  const [tipo, setTipo] = useState("fixa");
  const [cartao, setCartao] = useState(""); 

  const [mesPrimeiraParcela, setMesPrimeiraParcela] = useState(""); 
  const [anoPrimeiraParcela, setAnoPrimeiraParcela] = useState(""); 
  const [parcelas, setParcelas] = useState("");
  
  const handleSalvar = async () => { 
    if (!descricao || !valor) {
      Toast.show({
        type: "error",
        text1: "Campos obrigatórios!",
        text2: "Preencha os campos marcados com (*).",
        position: "top",
        visibilityTime: 3000,
      });
      return;
    }

    if (natureza === "despesa" && tipo === "parcelada") {
      if (!mesPrimeiraParcela || !anoPrimeiraParcela || !parcelas) {
        Toast.show({
          type: "error",
          text1: "Campos obrigatórios!",
          text2: "Preencha os campos marcados com (*).",
          position: "top",
          visibilityTime: 3000,
        });
        return;
      }
    }

    try {
      const novoItem = {
        id: Date.now().toString(),
        natureza: natureza.toLowerCase(),
        descricao,
        emoji,
        valor: parseFloat(valor),
        tipo,
        cartao,
        mesPrimeiraParcela: parseInt(mesPrimeiraParcela) || 0,
        anoPrimeiraParcela: parseInt(anoPrimeiraParcela) || 0,
        parcelas: parseInt(parcelas) || 0,
      };

      const resultado = await adicionarItem(novoItem);

      if (resultado.success) {
        Toast.show({
          type: "success",
          text1: "Item salvo com sucesso!",
          position: "top",
          visibilityTime: 3000,
        });

        setTimeout(() => {
          navigation.goBack();
        }, 300);
      } else {
        throw new Error('Erro ao salvar item');
      }
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

  // gera anos (atual até 3 anos no futuro)
  const anoAtual = new Date().getFullYear();
  const anos = Array.from({ length: 3 }, (_, i) => ({
    label: (anoAtual + i).toString(),
    value: anoAtual + i
  }));

  return (
    <View style={[styles.wrapper, { backgroundColor: colors.secondBackground }]}>
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={[styles.title, { color: colors.text }]}>
          + {natureza === "receita" ? "receita" : "despesa"}
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
          placeholder="Emoji"
          placeholderTextColor="#888"
          value={emoji}
          onChangeText={setEmoji}
        />

        {natureza === "despesa" && (
          <CustomPicker
            options={[
              { label: "Fixa", value: "fixa" },
              { label: "Parcelada", value: "parcelada" }
            ]}
            selectedValue={tipo}
            onValueChange={(itemValue) => {
              if (itemValue === "parcelada" && cartoes.length === 0) {
                Toast.show({
                  type: "error",
                  text1: "Nenhum cartão cadastrado!",
                  text2: "Adicione um cartão antes de criar despesas parceladas.",
                  position: "top",
                  visibilityTime: 3000,
                });
                return;
              }
              
              setTipo(itemValue);
              if (itemValue === "parcelada" && cartoes.length > 0) {
                setCartao(""); 
              } else {
                setCartao("");
              }
            }}
            placeholder="Tipo de despesa"
          />
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

        {natureza === "despesa" && cartoes.length > 0 && (
          <CustomPicker
            options={[
              { label: "Nenhum cartão", value: "" },
              ...cartoes.map(c => ({
                label: `${c.emoji} ${c.nome}`,
                value: c.id
              }))
            ]}
            selectedValue={cartao}
            onValueChange={(itemValue) => setCartao(itemValue)}
            placeholder="Cartão (opcional)"
          />
        )}

        {tipo === "parcelada" && (
          <>
            {cartoes.length === 0 && (
              <Text style={[styles.warningText, { color: "#FF9800" }]}>
                Adicione um cartão para criar despesas parceladas
              </Text>
            )}
          </>
        )}

        {natureza === "despesa" && tipo === "parcelada" && (
          <>
            <CustomPicker
              options={MONTHS}
              selectedValue={mesPrimeiraParcela}
              onValueChange={(itemValue) => setMesPrimeiraParcela(itemValue)}
              placeholder="Mês da primeira parcela (*)"
            />

            <CustomPicker
              options={anos}
              selectedValue={anoPrimeiraParcela}
              onValueChange={(itemValue) => setAnoPrimeiraParcela(itemValue)}
              placeholder="Ano da primeira parcela (*)"
            />
          </>
        )}

        {tipo === "parcelada" && (
          <TextInput
            style={[styles.input, { borderColor: colors.text, color: colors.text }]}
            placeholder="Nº de parcelas (*)"
            placeholderTextColor="#888"
            keyboardType="numeric"
            value={parcelas}
            onChangeText={setParcelas}
          />
        )}

        {/* Botões lado a lado com ícones */}
        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={[styles.iconButton, { backgroundColor: "#4CAF50" }]}
            onPress={handleSalvar}
          >
            <Feather name="check" size={28} color="#FFF" />
            <Text style={styles.iconButtonText}>Salvar</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.iconButton, { backgroundColor: "#757575" }]}
            onPress={() => navigation.goBack()}
          >
            <Feather name="x" size={28} color="#FFF" />
            <Text style={styles.iconButtonText}>Cancelar</Text>
          </TouchableOpacity>
        </View>
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
    gap: 12,
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 20,
  },
  input: {
    borderRightWidth: 1,
    marginBottom: 15,
    marginLeft: 20,
    marginRight: 20,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginTop: 20,
    marginHorizontal: 20,
  },
  iconButton: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 10,
    gap: 8,
  },
  iconButtonText: {
    color: '#FFF',
    fontSize: 13,
    fontWeight: '600',
  },
  warningText: {
    fontSize: 13,
    fontWeight: '500',
    marginHorizontal: 20,
    marginBottom: 10,
    textAlign: 'center',
  },
});