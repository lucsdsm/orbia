import React, { useMemo, useCallback, useEffect } from "react";
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from "react-native";

import { useTheme } from "../contexts/ThemeContext";
import { useItens } from "../contexts/ItensContext";
import { useCartoes } from "../contexts/CartoesContext";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import Toast from "react-native-toast-message";
import { MaterialIcons } from "@expo/vector-icons";

import ParcelProgress from "../components/ParcelProgress";

const ItemList = React.memo(() => {
  const { colors } = useTheme();
  const { itens, recarregarItens, deletarItem } = useItens();
  const { cartoes } = useCartoes();
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
      const resultado = await deletarItem(id);
      if (resultado.success) {
        await recarregarItens(); // recarrega a lista
        
        Toast.show({
          type: "success",
          text1: "Item removido!",
          position: "top",
          visibilityTime: 2000,
        });
      } else {
        throw new Error('Erro ao remover');
      }
    } catch (error) {
      Toast.show({
        type: "error",
        text1: "Erro ao remover item.",
        position: "top",
      });
    }
  }, [deletarItem, recarregarItens]);

  const renderItem = useCallback((props) => {
    const { item } = props;
    const cartaoData = item.cartaoId ? cartoes.find(c => c.id === item.cartaoId) : (item.cartao ? cartoes.find(c => c.id === item.cartao) : null);
    
    return (
      <TouchableOpacity
        activeOpacity={0.8}
        style={[styles.item, { backgroundColor: colors.card, borderLeftColor: item.natureza === "receita" ? "#4CAF50" : "#F44336" }]}
        onPress={() => navigation.navigate("ItemEdit", {
        item,
        onEdit: async (itemEditado) => {
          await StorageService.updateItem(itemEditado.id, itemEditado);
          await recarregarItens();
        }
      })}>
      <View style={{ flex: 1 }}>
        {/* emoji */}
        <Text style={[styles.descricao, { color: colors.text }]}>{item.categoria || item.emoji} {item.nome || item.descricao}</Text>

        <View style={styles.valorRow}>

          {/* cartão */}
          {cartaoData && (
            <View style={{
              backgroundColor: cartaoData.cor || cartaoData.color || "gray",
              paddingHorizontal: 8,
              paddingVertical: 4,
              borderRadius: 15,
              marginLeft: 8,
            }}>
              <Text style={{ color: "#FFFFFF", fontSize: 11, fontWeight: "600" }}>
                {cartaoData.emoji || "💳"}
              </Text>
            </View>
          )}

          <Text style={[styles.valor, { color: colors.text }]}>
            {item.natureza === "receita" ? "+" : "-"} R$ {item.valor.toFixed(2)}
          </Text>

          {item.natureza === "despesa" && item.tipo === "fixa" && (
            <Text style={styles.emoji}>📌</Text>
          )}

          {item.natureza === "despesa" && item.tipo === "parcelada" && (item.mesPrimeiraParcela || item.mes_primeira_parcela) && (item.anoPrimeiraParcela || item.ano_primeira_parcela) && item.parcelas && (
            <ParcelProgress
              mesPrimeiraParcela={item.mesPrimeiraParcela || item.mes_primeira_parcela}
              anoPrimeiraParcela={item.anoPrimeiraParcela || item.ano_primeira_parcela}
              totalParcelas={item.parcelas}
              cor={colors.text}
            />
          )}
        </View>
      </View>
    </TouchableOpacity>
    );
  }, [colors, navigation, recarregarItens, cartoes]);

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
    paddingLeft: 30,
    paddingRight: 30,
    
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