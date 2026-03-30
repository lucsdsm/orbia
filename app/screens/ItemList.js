import React, { useMemo, useCallback } from "react";
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from "react-native";

import { useTheme } from "../contexts/ThemeContext";
import { useItens } from "../contexts/ItensContext";
import { useCartoes } from "../contexts/CartoesContext";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import ParcelProgress from "../components/ParcelProgress";
import { StorageService } from "../services/storage";
import { formatCurrency } from "../utils/formatters";

const ItemList = React.memo(() => {
  const { colors } = useTheme();
  const { itens, recarregarItens } = useItens();
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

  const renderItem = useCallback((props) => {
    const { item } = props;
    const cartaoData = item.cartaoId
      ? cartoes.find((c) => c.id === item.cartaoId)
      : (item.cartao ? cartoes.find((c) => c.id === item.cartao) : null);

    const corBorda = item.natureza === "receita" ? "#4CAF50" : "#F44336";
    const nomeItem = item.nome || item.descricao;
    const prefixoValor = item.natureza === "receita" ? "+ " : "";
    
    return (
      <TouchableOpacity
        activeOpacity={0.8}
        style={[styles.item, { backgroundColor: colors.card, borderLeftColor: corBorda }]}
        onPress={() => navigation.navigate("ItemEdit", {
          item,
          onEdit: async (itemEditado) => {
            await StorageService.updateItem(itemEditado.id, itemEditado);
            await recarregarItens();
          }
        })}>
        <View style={{ flex: 1 }}>
          <View style={styles.descricaoRow}>
            <Text style={[styles.descricao, { color: colors.text }]} numberOfLines={1}>
              {item.categoria || item.emoji || (item.natureza === "receita" ? "💰" : "💸")} {nomeItem}
            </Text>
            {cartaoData && (
              <Text style={[styles.cartaoNome, { color: colors.textSecondary }]} numberOfLines={1}>
                {cartaoData.emoji || "💳"} {cartaoData.nome}
              </Text>
            )}
          </View>

          <View style={styles.valorRow}>
            <Text
              style={[
                styles.valor,
                { color: item.natureza === "receita" ? "#4CAF50" : "#F44336" }
              ]}
            >
              {prefixoValor}R$ {formatCurrency(item.valor)}
            </Text>

            {item.natureza === "despesa" && item.tipo === "parcelada" && (item.mesPrimeiraParcela || item.mes_primeira_parcela) && (item.anoPrimeiraParcela || item.ano_primeira_parcela) && item.parcelas && (
              <ParcelProgress
                mesPrimeiraParcela={item.mesPrimeiraParcela || item.mes_primeira_parcela}
                anoPrimeiraParcela={item.anoPrimeiraParcela || item.ano_primeira_parcela}
                totalParcelas={item.parcelas}
                cor={colors.text}
              />
            )}

            {item.natureza === "despesa" && item.tipo === "fixa" && (
              <Text style={[styles.tipoTag, { color: colors.textSecondary }]}>Fixa</Text>
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
    paddingBottom: 30,
  },
  item: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    minHeight: 70,
    padding: 15,
    borderRadius: 5,
    marginBottom: 10,
    borderLeftWidth: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  descricaoRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
  },
  cartaoNome: {
    fontSize: 11,
    fontWeight: "600",
    maxWidth: "40%",
  },
  descricao: {
    fontWeight: "bold",
    fontSize: 14,
    flex: 1,
  },
  valorRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 4,
  },
  valor: {
    fontWeight: "bold",
    fontSize: 14,
  },
  tipoTag: {
    fontSize: 12,
    fontWeight: "600",
    opacity: 0.7,
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