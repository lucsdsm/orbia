import React, { useState } from "react";
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from "react-native";
import { Feather } from "@expo/vector-icons";
import { useTheme } from "../contexts/ThemeContext";
import { useCartoes } from "../contexts/CartoesContext";
import Toast from "react-native-toast-message";

import CustomPicker from "../components/CustomPicker";

import { StorageService } from "../services/storage";
import { MONTHS } from "../constants";

export default function ItemEdit({ route, navigation }) {
  const { colors } = useTheme();
  const { cartoes } = useCartoes();
  const { item, onEdit } = route.params;

  const [descricao, setDescricao] = useState(item.nome || item.descricao);
  const [emoji, setEmoji] = useState(item.categoria || item.emoji);
  const [valor, setValor] = useState(item.valor.toString());
  const [tipo, setTipo] = useState(item.tipo || "fixa");
  const [cartao, setCartao] = useState(item.cartaoId || item.cartao || "");
  const [mesPrimeiraParcela, setMesPrimeiraParcela] = useState(item.mesPrimeiraParcela?.toString() || "");
  const [anoPrimeiraParcela, setAnoPrimeiraParcela] = useState(item.anoPrimeiraParcela?.toString() || "");
  const [parcelas, setParcelas] = useState(item.parcelas?.toString() || "");

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

    if (tipo === "parcelada" && (!cartao || !mesPrimeiraParcela || !anoPrimeiraParcela || !parcelas)) {
      Toast.show({
        type: "error",
        text1: "Campos obrigatórios!",
        text2: "Preencha os campos marcados com (*).",
        position: "top",
        visibilityTime: 3000,
      });
      return;
    }

    try {
      const itemEditado = {
        ...item,          
        nome: descricao,
        descricao: descricao, // mantém compatibilidade
        categoria: emoji,
        emoji: emoji, // mantém compatibilidade
        valor: parseFloat(valor),
        tipo,
        cartaoId: cartao,
        cartao: cartao, // mantém compatibilidade
        mesPrimeiraParcela: parseInt(mesPrimeiraParcela) || 0,
        anoPrimeiraParcela: parseInt(anoPrimeiraParcela) || 0,
        parcelas: parseInt(parcelas) || 0,
      };

      await StorageService.updateItem(itemEditado.id, itemEditado);

      if (onEdit) onEdit(itemEditado);

      Toast.show({
        type: "success",
        text1: "Item atualizado!",
      });

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

  // Gera anos (atual até 5 anos no futuro)
  const anoAtual = new Date().getFullYear();
  const anos = Array.from({ length: 6 }, (_, i) => ({
    label: (anoAtual + i).toString(),
    value: anoAtual + i
  }));

  return (
    <View style={[styles.wrapper, { backgroundColor: colors.secondBackground }]}>
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={[styles.title, { color: colors.text }]}>~ {item.nome || item.descricao} </Text>

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

        {item.natureza === "despesa" && (
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
                setCartao(cartoes[0].id);
              } else {
                setCartao("");
              }
              if (itemValue === "fixa") {
                setMesPrimeiraParcela("");
                setAnoPrimeiraParcela("");
                setParcelas("");
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

        {tipo === "parcelada" && (
          <>
            <CustomPicker
              options={cartoes.map(c => ({
                label: `${c.emoji} ${c.nome}`,
                value: c.id
              }))}
              selectedValue={cartao}
              onValueChange={(itemValue) => setCartao(itemValue)}
              placeholder="Selecione um cartão"
            />

            {item.natureza === "despesa" && (
              <>
                <CustomPicker
                  options={MONTHS}
                  selectedValue={mesPrimeiraParcela ? parseInt(mesPrimeiraParcela) : ""}
                  onValueChange={(itemValue) => setMesPrimeiraParcela(itemValue.toString())}
                  placeholder="Mês da primeira parcela (*)"
                />

                <CustomPicker
                  options={anos}
                  selectedValue={anoPrimeiraParcela ? parseInt(anoPrimeiraParcela) : ""}
                  onValueChange={(itemValue) => setAnoPrimeiraParcela(itemValue.toString())}
                  placeholder="Ano da primeira parcela (*)"
                />
              </>
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

        {/* Botões lado a lado com ícones */}
        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={[styles.iconButton, { backgroundColor: "#4CAF50" }]}
            onPress={handleSalvar}
          >
            <Feather name="check" size={24} color="#FFF" />
            <Text style={styles.iconButtonText}>Salvar</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.iconButton, { backgroundColor: "#F44336" }]}
            onPress={async () => {
              try {
                await StorageService.deleteItem(item.id);
                Toast.show({
                  type: "error",
                  text1: "Item excluído!",
                  position: "top",
                  visibilityTime: 2000,
                });
                navigation.goBack();
              } catch (error) {
                Toast.show({
                  type: "error",
                  text1: "Erro ao excluir item.",
                  position: "top",
                });
              }
            }}
          >
            <Feather name="trash-2" size={24} color="#FFF" />
            <Text style={styles.iconButtonText}>Excluir</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.iconButton, { backgroundColor: "#757575" }]}
            onPress={() => navigation.goBack()}
          >
            <Feather name="x" size={24} color="#FFF" />
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
    marginBottom: 40,
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
    gap: 8,
    marginTop: 20,
    marginHorizontal: 10,
  },
  iconButton: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 10,
    gap: 6,
  },
  iconButtonText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '600',
  },
});