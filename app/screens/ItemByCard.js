import React, { useMemo, useCallback } from "react";
import { View, Text, StyleSheet, SectionList, TouchableOpacity } from "react-native";
import { useTheme } from "../contexts/ThemeContext";
import { useItens } from "../contexts/ItensContext";
import { useCartoes } from "../contexts/CartoesContext";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { showToast } from "../utils/toast";
import ParcelProgress from "../components/ParcelProgress";
import { StorageService } from "../services/storage";
import { calcularGastoItem, calcularPercentualLimite } from "../utils/calculations";
import { formatCurrency } from "../utils/formatters";

const ItemByCard = React.memo(() => {
  const { colors } = useTheme();
  const navigation = useNavigation();
  const { itens, recarregarItens } = useItens();
  const { cartoes } = useCartoes();

  useFocusEffect(
    useCallback(() => {
      recarregarItens();
    }, [recarregarItens])
  );

  // agrupa despesas parceladas por cartão
  const itensPorCartao = useMemo(() => {
    const despesasParceladas = itens.filter(
      (item) => item.natureza === "despesa" && item.tipo === "parcelada" && item.cartao
    );

    const grupos = {};

    despesasParceladas.forEach((item) => {
      const cartaoId = item.cartao;
      
      if (!grupos[cartaoId]) {
        grupos[cartaoId] = {
          cartao: cartaoId,
          itens: [],
          total: 0,
        };
      }

      grupos[cartaoId].itens.push(item);
      grupos[cartaoId].total += calcularGastoItem(item);
    });

    // converte para array e ordena por total
    const sections = Object.values(grupos)
      .sort((a, b) => b.total - a.total)
      .map((grupo) => {
        const cartaoInfo = cartoes.find((c) => c.id === grupo.cartao);

        // Ordena os itens pelas parcelas restantes (menor primeiro)
        const itensOrdenados = grupo.itens.slice().sort((a, b) => {
          // Calcula parcelas restantes para cada item
          const hoje = new Date();
          const mesesPassadosA = (hoje.getFullYear() - a.anoPrimeiraParcela) * 12 + (hoje.getMonth() + 1 - a.mesPrimeiraParcela);
          const parcelasRestantesA = Math.max(0, parseInt(a.parcelas) - mesesPassadosA);

          const mesesPassadosB = (hoje.getFullYear() - b.anoPrimeiraParcela) * 12 + (hoje.getMonth() + 1 - b.mesPrimeiraParcela);
          const parcelasRestantesB = Math.max(0, parseInt(b.parcelas) - mesesPassadosB);

          return parcelasRestantesA - parcelasRestantesB;
        });

        return {
          title: cartaoInfo ? `${cartaoInfo.emoji} ${cartaoInfo.nome}` : grupo.cartao,
          cartao: grupo.cartao,
          total: grupo.total,
          color: cartaoInfo?.color || "gray",
          data: itensOrdenados,
        };
      });

    return sections;
  }, [itens, cartoes]);

  const renderItem = useCallback(({ item }) => {
    const cartaoData = item.cartao ? cartoes.find(c => c.id === item.cartao) : null;
    
    return (
      <TouchableOpacity
        activeOpacity={0.8}
        style={[styles.item, { backgroundColor: colors.card, borderLeftColor: "#F44336" }]}
        onPress={() => navigation.navigate("ItemEdit", {
          item,
          onEdit: async (itemEditado) => {
            await StorageService.updateItem(itemEditado.id, itemEditado);
            await recarregarItens();
          }
        })}>
        <View style={{ flex: 1 }}>
          <Text style={[styles.descricao, { color: colors.text }]}>
            {item.emoji} {item.descricao}
          </Text>

          <View style={styles.valorRow}>
            <Text style={[styles.valor, { color: colors.text }]}>
              R$ {formatCurrency(item.valor)}
            </Text>

            {item.mesPrimeiraParcela && item.anoPrimeiraParcela && item.parcelas && (
              <ParcelProgress
                mesPrimeiraParcela={item.mesPrimeiraParcela}
                anoPrimeiraParcela={item.anoPrimeiraParcela}
                totalParcelas={item.parcelas}
                cor={colors.text}
              />
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  }, [colors, navigation, recarregarItens, cartoes]);

  const renderSectionHeader = useCallback(({ section: { title, total, cartao, color } }) => {
    const cartaoInfo = cartoes.find((c) => c.id === cartao);
    const limite = cartaoInfo?.limite || 0;
    const percentualUtilizado = calcularPercentualLimite(total, limite);

    return (
      <View style={[styles.sectionHeader, { backgroundColor: colors.background }]}>
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
          <View
            style={{
              backgroundColor: color,
              paddingHorizontal: 12,
              paddingVertical: 6,
              borderRadius: 20,
              width: '50%',
            }}
          >
            <Text style={{ color: "#FFFFFF", fontSize: 14, fontWeight: "bold" }}>
              {title}
            </Text>
          </View>
          <Text style={[styles.sectionTotal, { color: colors.text }]}>
            R$ {formatCurrency(total)}
          </Text>
        </View>

        {limite > 0 && (
          <View style={{ marginTop: 8, gap: 4 }}>
            <View style={[styles.progressBarContainer, { backgroundColor: colors.card }]}>
              <View 
                style={[
                  styles.progressBar, 
                  { 
                    backgroundColor: color,
                    width: `${percentualUtilizado}%`
                  }
                ]} 
              />
            </View>
            <Text style={[styles.limiteText, { color: colors.textSecondary }]}>
              Limite: R$ {formatCurrency(limite)}
            </Text>
          </View>
        )}
      </View>
    );
  }, [colors, cartoes]);

  const keyExtractor = useCallback((item) => item.id, []);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {itensPorCartao.length === 0 ? (
        <View style={styles.vazioContainer}>
          <Text style={[styles.vazio, { color: colors.text }]}>
            Nenhuma despesa parcelada com cartão cadastrada 💳
          </Text>
        </View>
      ) : (
        <SectionList
          sections={itensPorCartao}
          keyExtractor={keyExtractor}
          renderItem={renderItem}
          renderSectionHeader={renderSectionHeader}
          contentContainerStyle={styles.listContent}
          stickySectionHeadersEnabled={false}
          initialNumToRender={10}
          maxToRenderPerBatch={10}
          windowSize={5}
          removeClippedSubviews={true}
        />
      )}
    </View>
  );
});

export default ItemByCard;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  listContent: {
    padding: 20,
    paddingLeft: 30,
    paddingRight: 30,
    
  },
  sectionHeader: {
    paddingVertical: 12,
    paddingHorizontal: 5,
    marginBottom: 10,
    borderRadius: 8,
  },
  sectionTotal: {
    fontSize: 18,
    fontWeight: "bold",
  },
  progressBarContainer: {
    marginTop: 5,
    width: '100%',
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    borderRadius: 3,
  },
  limiteText: {
    fontSize: 11,
    fontWeight: '500',
  },
  item: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    minHeight: 70,
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    borderLeftWidth: 5,
    borderLeftColor: "#F44336",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  descricao: {
    fontWeight: "bold",
    fontSize: 14,
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
  vazioContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  vazio: {
    textAlign: "center",
    fontSize: 16,
  },
});
