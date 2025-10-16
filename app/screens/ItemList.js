import React, { useState, useMemo } from "react";
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { useTheme } from "../ThemeContext";

import { useNavigation, useFocusEffect } from "@react-navigation/native";

import Toast from "react-native-toast-message";

import { MaterialIcons } from "@expo/vector-icons";

import ParcelProgress from "../components/ParcelProgress";

export default function ItemList() {
  const { colors } = useTheme();
  const [itens, setItens] = useState([]);
  const navigation = useNavigation();

  const carregarItens = async () => {
    try {
      const itensExistentes = await AsyncStorage.getItem("itens");
      const itensCarregados = itensExistentes ? JSON.parse(itensExistentes) : [];
      setItens(itensCarregados);
    } catch (error) {
      console.log("Erro ao carregar itens:", error);
    }
  };

  // ordena itens por valor (maior para menor)
  const itensOrdenados = useMemo(() => {
    return [...itens].sort((a, b) => {
      const valorA = parseFloat(a.valor) || 0;
      const valorB = parseFloat(b.valor) || 0;
      return valorB - valorA; 
    });
  }, [itens]);

  // recarrega sempre que a tela receber foco
  useFocusEffect(
    React.useCallback(() => {
      carregarItens();
    }, [])
  );

  // função para remover item
  const removerItem = async (id) => {
    try {
      const novosItens = itens.filter(item => item.id !== id);
      await AsyncStorage.setItem("itens", JSON.stringify(novosItens));
      setItens(novosItens);
      
      Toast.show({
        type: "success",
        text1: "Item removido!",
        position: "top",
        visibilityTime: 2000,
      });
    } catch (error) {
      console.log("Erro ao remover item:", error);
    }
  };

  // renderiza cada item da lista
  const renderItem = ({ item }) => (
    <View style={[styles.item, { backgroundColor: colors.text, borderLeftColor: item.natureza === "receita" ? "#4CAF50" : "#F44336" }]}>
      <View style={{ flex: 1 }}>
        <Text style={[styles.descricao, { color: colors.background }]}>{item.descricao}</Text>
        
        <View style={styles.valorRow}>
          <Text style={[styles.valor, { color: colors.background }]}>
            {item.natureza === "receita" ? "+" : "-"} R$ {item.valor.toFixed(2)}
          </Text>
          
          {item.natureza === "despesa" && item.tipo === "fixa" && (
            <Text style={styles.emoji}>📌</Text>
          )}
          
          {/* progresso para despesa parcelada */}
          {item.natureza === "despesa" && item.tipo === "parcelada" && item.data && item.parcelas && (
            <ParcelProgress 
              dataCompra={item.data}
              totalParcelas={item.parcelas}
              cor={colors.background}
            />
          )}
          {/* cartão */}
          {item.natureza === "despesa" && item.tipo === "parcelada" && item.cartao && (
            <Text style={[styles.emoji, { color: colors.background }]}>
              {item.cartao === "nubank" ? "Nubank 🔮" : item.cartao === "inter" ? "Inter 🦊" : "💳"}
            </Text>
          )}
        </View>
      </View>

      {/* botões */}
      <View style={{ flexDirection: "row", alignItems: "center", gap: 15 }}>
        {/* botão de editar */}
        <TouchableOpacity
          onPress={() => navigation.navigate("ItemEdit", {
            item,
            onEdit: async (itemEditado) => {
              try {
                const itensAtualizados = itens.map(i => i.id === itemEditado.id ? itemEditado : i);
                await AsyncStorage.setItem("itens", JSON.stringify(itensAtualizados));
                setItens(itensAtualizados);
              } catch (error) {
                console.log("Erro ao atualizar item:", error);
              }
            }
          })}
          style={{ marginRight: 10 }}
        >
          <MaterialIcons name="edit" size={28} color={colors.background} />
        </TouchableOpacity>
        
        {/* botão de lixeira */}
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
          style={{ alignItems: "center", justifyContent: "center" }}
        >
          <MaterialIcons name="delete" size={28} color={colors.background} />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {itensOrdenados.length === 0 ? (
        <Text style={[styles.vazio, { color: colors.text }]}>
          Nenhum item cadastrado, ainda 😄.
        </Text>
      ) : (
        <FlatList
          data={itensOrdenados}
          keyExtractor={(item) => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
    padding: 20,
  },
  item: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    height: 80,
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    borderLeftWidth: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  descricao: {
    fontWeight: "bold",
  },
  valorRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 2,
  },
  valor: {
    fontWeight: "bold",
  },
  emoji: {
    fontSize: 14,
  },
  vazio: {
    textAlign: "center",
    marginTop: 50,
    fontSize: 16,
  },
});