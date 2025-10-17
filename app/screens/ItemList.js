import React, { useMemo, useCallback } from "react";
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from "react-native";

import { useTheme } from "../ThemeContext";
import { useItens } from "../ItensContext";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import Toast from "react-native-toast-message";
import { MaterialIcons } from "@expo/vector-icons";

import { CARDS } from "../constants";

import ParcelProgress from "../components/ParcelProgress";
import { StorageService } from "../services/storage";

const ItemList = React.memo(() => {
  const { colors } = useTheme();
  const { itens, recarregarItens } = useItens();
  const navigation = useNavigation();

  useFocusEffect(
    useCallback(() => {
      recarregarItens();
    }, [recarregarItens])
  );

  const itensOrdenados = useMemo(() => {
    return [...itens].sort((a, b) => {
      // 1º critério: receitas primeiro, depois despesas
      if (a.natureza !== b.natureza) {
        return a.natureza === "receita" ? -1 : 1;
      }

      // 2º critério: se ambos forem despesas, fixas primeiro
      if (a.natureza === "despesa" && a.tipo !== b.tipo) {
        return a.tipo === "fixa" ? -1 : 1;
      }

      // 3º critério: maior valor primeiro
      const valorA = parseFloat(a.valor) || 0;
      const valorB = parseFloat(b.valor) || 0;
      return valorB - valorA;
    });
  }, [itens]);

  const removerItem = useCallback(async (id) => {
    try {
      await StorageService.deleteItem(id);
      await recarregarItens(); // Recarrega a lista
      
      Toast.show({
        type: "success",
        text1: "Item removido!",
        position: "top",
        visibilityTime: 2000,
      });
    } catch (error) {
      console.log("Erro ao remover item:", error);
      Toast.show({
        type: "error",
        text1: "Erro ao remover item.",
        position: "top",
      });
    }
  }, [recarregarItens]);

  const renderItem = useCallback(({ item }) => (
    <View style={[styles.item, { backgroundColor: colors.text, borderLeftColor: item.natureza === "receita" ? "#4CAF50" : "#F44336" }]}>
      <View style={{ flex: 1 }}>
        {/* emoji */}
        <Text style={[styles.descricao, { color: colors.background }]}>{item.emoji} {item.descricao}</Text>
        
        <View style={styles.valorRow}>
          <Text style={[styles.valor, { color: colors.background }]}>
            {item.natureza === "receita" ? "+" : "-"} R$ {item.valor.toFixed(2)}
          </Text>
          
          {item.natureza === "despesa" && item.tipo === "fixa" && (
            <Text style={styles.emoji}>📌</Text>
          )}
          
          {item.natureza === "despesa" && item.tipo === "parcelada" && item.data && item.parcelas && (
            <ParcelProgress 
              dataCompra={item.data}
              totalParcelas={item.parcelas}
              cor={colors.background}
            />
          )}

          {/* cartão */}
          {item.cartao && (
            <View style={{
              // retornar cor do cartão conforme constante
              backgroundColor: CARDS.find(c => c.value === item.cartao)?.color || "gray",
              paddingHorizontal: 8,
              paddingVertical: 4,
              borderRadius: 15,
              marginLeft: 8,
            }}>
              <Text style={{ color: "#FFFFFF", fontSize: 11, fontWeight: "600" }}>
                {CARDS.find(c => c.value === item.cartao)?.label || "Cartão Desconhecido"}
              </Text>
            </View>
          )}
        </View>
      </View>

      <View style={{ flexDirection: "row", alignItems: "center" }}>
        <TouchableOpacity
          onPress={() => navigation.navigate("ItemEdit", {
            item,
            onEdit: async (itemEditado) => {
              await StorageService.updateItem(itemEditado.id, itemEditado);
              await recarregarItens();
            }
          })}
          style={{ marginRight: 10 }}
        >
          <MaterialIcons name="edit" size={28} color={colors.background} />
        </TouchableOpacity>
        
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
  ), [colors, navigation, recarregarItens, removerItem]);

  const keyExtractor = useCallback((item) => item.id, []);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {itensOrdenados.length === 0 ? (
        <View style={styles.vazioContainer}>
          <Text style={[styles.vazio, { color: colors.text }]}>
            Nenhum item cadastrado, por enquanto 😲.
          </Text>
        </View>
        ) : (
          <FlatList
            data={itensOrdenados}
            keyExtractor={keyExtractor}
            renderItem={renderItem}
            contentContainerStyle={styles.listContent}
            initialNumToRender={10}
            maxToRenderPerBatch={10}
            windowSize={5}
            removeClippedSubviews={true}
            updateCellsBatchingPeriod={50}
          />
        )}
      </View>
  );
});

export default ItemList;

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
    marginTop: 7,
  },
  valor: {
    fontWeight: "bold",
  },
  emoji: {
    fontSize: 14,
  },
  vazioContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  vazio: {
    textAlign: "center",
    fontSize: 16,
  },
});