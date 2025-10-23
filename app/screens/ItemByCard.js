import React, { useMemo, useCallback } from "react";
import { View, Text, StyleSheet, SectionList, TouchableOpacity } from "react-native";
import { useTheme } from "../contexts/ThemeContext";
import { useItens } from "../contexts/ItensContext";
import { useCartoes } from "../contexts/CartoesContext";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import Toast from "react-native-toast-message";
import { MaterialIcons } from "@expo/vector-icons";

import ParcelProgress from "../components/ParcelProgress";
import { StorageService } from "../services/storage";

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

  const removerItem = useCallback(async (id) => {
    try {
      await StorageService.deleteItem(id);
      await recarregarItens();
      
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

  // agrupa despesas parceladas por cartão
  const itensPorCartao = useMemo(() => {
    // filtra apenas despesas parceladas que têm cartão
    const despesasParceladas = itens.filter(
      (item) => item.natureza === "despesa" && item.tipo === "parcelada" && item.cartao
    );

    // agrupa por cartão
    const grupos = {};
    const hoje = new Date();

    despesasParceladas.forEach((item) => {
      const cartao = item.cartao;
      
      if (!grupos[cartao]) {
        grupos[cartao] = {
          cartao,
          itens: [],
          total: 0,
        };
      }

      grupos[cartao].itens.push(item);
      
      // calcula apenas as parcelas restantes
      if (item.tipo === 'parcelada' && item.parcelas) {
        const valorParcela = parseFloat(item.valor) || 0;
        const totalParcelas = parseInt(item.parcelas, 10) || 0;
        grupos[cartao].total += valorParcela * totalParcelas;
      } else { // para fixas ou outras, considera o valor único
        grupos[cartao].total += parseFloat(item.valor) || 0;
      }
    });

    // converte para array e ordena por total (maior primeiro)
    const sections = Object.values(grupos)
      .sort((a, b) => b.total - a.total)
      .map((grupo) => {
        const cartaoInfo = cartoes.find((c) => c.id === grupo.cartao);
        return {
          title: cartaoInfo ? `${cartaoInfo.emoji} ${cartaoInfo.nome}` : grupo.cartao,
          cartao: grupo.cartao,
          total: grupo.total,
          color: cartaoInfo?.color || "gray",
          data: grupo.itens.sort((a, b) => {
            const valorA = parseFloat(a.valor) || 0;
            const valorB = parseFloat(b.valor) || 0;
            return valorB - valorA;
          }),
        };
      });

    return sections;
  }, [itens, cartoes]);

  const renderItem = useCallback(({ item }) => {
    // Busca o cartão UMA ÚNICA VEZ e armazena em uma variável
    const cartaoData = item.cartao ? cartoes.find(c => c.id === item.cartao) : null;
    
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
          <Text style={[styles.descricao, { color: colors.text }]}>
            {item.emoji} {item.descricao}
          </Text>

          <View style={styles.valorRow}>
            <Text style={[styles.valor, { color: colors.text }]}>
              R$ {item.valor.toFixed(2)}
            </Text>

            {item.data && item.parcelas && (
              <ParcelProgress
                dataCompra={item.data}
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
    const percentualUtilizado = limite > 0 ? (total / limite) * 100 : 0;
    const percentualLimitado = Math.min(percentualUtilizado, 100);

    return (
      <View style={[styles.sectionHeader, { backgroundColor: colors.background }]}>
        <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
          <View
            style={{
              backgroundColor: color,
              paddingHorizontal: 12,
              paddingVertical: 6,
              borderRadius: 20,
            }}
          >
            <Text style={{ color: "#FFFFFF", fontSize: 14, fontWeight: "bold" }}>
              {title}
            </Text>
          </View>
          <Text style={[styles.sectionTotal, { color: colors.text }]}>
            R$ {total.toFixed(2)}
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
                    width: `${percentualLimitado}%`
                  }
                ]} 
              />
            </View>
            <Text style={[styles.limiteText, { color: colors.textSecondary }]}>
              Limite: R$ {limite.toFixed(2)}
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
  },
  vazio: {
    textAlign: "center",
    fontSize: 16,
  },
});
