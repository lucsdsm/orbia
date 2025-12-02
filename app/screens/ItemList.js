import React, { useMemo, useCallback, useEffect } from "react";
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Dimensions } from "react-native";

import { useTheme } from "../contexts/ThemeContext";
import { useItens } from "../contexts/ItensContext";
import { useCartoes } from "../contexts/CartoesContext";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import Toast from "react-native-toast-message";
import { MaterialIcons } from "@expo/vector-icons";

const { width } = Dimensions.get('window');
const numColumns = 2;
const itemWidth = (width - 60 - 10) / numColumns; // padding + gap

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
        style={[
          styles.item, 
          { 
            backgroundColor: colors.card, 
            borderTopColor: item.natureza === "receita" ? "#4CAF50" : "#F44336",
            width: itemWidth,
          }
        ]}
        onPress={() => navigation.navigate("ItemEdit", {
          item,
          onEdit: async (itemEditado) => {
            await StorageService.updateItem(itemEditado.id, itemEditado);
            await recarregarItens();
          }
        })}>
        <View style={styles.itemContent}>
          {/* Emoji e Cartão no topo */}
          <View style={styles.topRow}>
            <Text style={[styles.emoji, { fontSize: 28 }]}>
              {item.categoria || item.emoji || (item.natureza === "receita" ? "💰" : "💸")}
            </Text>
            {cartaoData && (
              <View style={[styles.cartaoTag, { backgroundColor: cartaoData.cor || cartaoData.color || "gray" }]}>
                <Text style={styles.cartaoEmoji}>{cartaoData.emoji || "💳"}</Text>
              </View>
            )}
          </View>

          {/* Descrição */}
          <Text style={[styles.descricao, { color: colors.text }]} numberOfLines={2}>
            {item.nome || item.descricao}
          </Text>

          {/* Valor */}
          <Text style={[styles.valor, { color: item.natureza === "receita" ? "#4CAF50" : "#F44336" }]}>
            {item.natureza === "receita" ? "+" : "-"} R$ {item.valor.toFixed(2)}
          </Text>

          {/* Indicadores */}
          <View style={styles.indicators}>
            {item.natureza === "despesa" && item.tipo === "fixa" && (
              <Text style={styles.indicatorEmoji}>📌</Text>
            )}
            {item.natureza === "despesa" && item.tipo === "parcelada" && item.parcelas && (
              <Text style={[styles.parcelaText, { color: colors.textSecondary }]}>
                {item.parcelas}x
              </Text>
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
            numColumns={numColumns}
            contentContainerStyle={styles.listContent}
            columnWrapperStyle={styles.columnWrapper}
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
    paddingBottom: 40,
  },
  columnWrapper: {
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  item: {
    borderRadius: 12,
    borderTopWidth: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
    aspectRatio: 1, // Mantém formato quadrado
  },
  itemContent: {
    flex: 1,
    padding: 12,
    justifyContent: 'space-between',
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  emoji: {
    fontSize: 28,
  },
  cartaoTag: {
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 10,
  },
  cartaoEmoji: {
    fontSize: 14,
  },
  descricao: {
    fontWeight: "600",
    fontSize: 13,
    marginTop: 8,
    lineHeight: 18,
  },
  valor: {
    fontWeight: "bold",
    fontSize: 16,
    marginTop: 4,
  },
  indicators: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 6,
  },
  indicatorEmoji: {
    fontSize: 14,
  },
  parcelaText: {
    fontSize: 11,
    fontWeight: '600',
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