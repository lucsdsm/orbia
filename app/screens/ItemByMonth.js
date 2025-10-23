import React, { useMemo, useCallback } from "react";
import { View, Text, FlatList, StyleSheet, SectionList, TouchableOpacity } from "react-native";
import { useTheme } from "../contexts/ThemeContext";
import { useItens } from "../contexts/ItensContext";
import { useCartoes } from "../contexts/CartoesContext";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import Toast from "react-native-toast-message";
import { MaterialIcons } from "@expo/vector-icons";

import ParcelProgress from "../components/ParcelProgress";
import { StorageService } from "../services/storage";
import { MONTHS } from "../constants";

const ItemByMonth = React.memo(() => {
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

  // Calcula o mês/ano final de uma parcela
  const calcularMesFinal = (dataCompra, totalParcelas) => {
    if (!dataCompra || !totalParcelas) return null;

    const [dia, mes, ano] = dataCompra.split("/").map(Number);
    const dataInicial = new Date(ano, mes - 1, dia);
    
    // Adiciona o número de meses (parcelas - 1)
    dataInicial.setMonth(dataInicial.getMonth() + totalParcelas - 1);

    return {
      mes: dataInicial.getMonth() + 1, // 1-12
      ano: dataInicial.getFullYear(),
    };
  };

  // Agrupa despesas parceladas por mês/ano final
  const itensPorMes = useMemo(() => {
    // Filtra apenas despesas parceladas
    const despesasParceladas = itens.filter(
      (item) => item.natureza === "despesa" && item.tipo === "parcelada" && item.data && item.parcelas
    );

    // Agrupa por mês/ano final
    const grupos = {};

    despesasParceladas.forEach((item) => {
      const mesFinal = calcularMesFinal(item.data, item.parcelas);
      if (!mesFinal) return;

      const chave = `${mesFinal.ano}-${String(mesFinal.mes).padStart(2, "0")}`;
      
      if (!grupos[chave]) {
        grupos[chave] = {
          mes: mesFinal.mes,
          ano: mesFinal.ano,
          itens: [],
        };
      }

      grupos[chave].itens.push(item);
    });

    // Converte para array e ordena por data (mais recente primeiro)
    const sections = Object.values(grupos)
      .sort((a, b) => {
        if (a.ano !== b.ano) return a.ano - b.ano;
        return a.mes - b.mes;
      })
      .map((grupo) => ({
        title: `${MONTHS.find((m) => m.value === grupo.mes)?.label || grupo.mes}/${grupo.ano}`,
        data: grupo.itens.sort((a, b) => {
          const valorA = parseFloat(a.valor) || 0;
          const valorB = parseFloat(b.valor) || 0;
          return valorB - valorA;
        }),
      }));

    return sections;
  }, [itens]);

  const renderItem = useCallback((props) => {
    const { item } = props;
    
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

          <ParcelProgress
            dataCompra={item.data}
            totalParcelas={item.parcelas}
            cor={colors.text}
          />

          {/* Badge do cartão */}
          {cartaoData && (
            <View
              style={{
                backgroundColor: cartaoData.color || "gray",
                paddingHorizontal: 8,
                paddingVertical: 4,
                borderRadius: 15,
                marginLeft: 8,
              }}
            >
              <Text style={{ color: "#FFFFFF", fontSize: 11, fontWeight: "600" }}>
                {cartaoData.emoji || "💳"} {cartaoData.nome || "Cartão"}
              </Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
    );
  }, [colors, navigation, recarregarItens, cartoes]);

  const renderSectionHeader = useCallback(
    ({ section: { title } }) => (
      <View style={[styles.sectionHeader, { backgroundColor: colors.background }]}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>{title}</Text>
      </View>
    ),
    [colors]
  );

  const keyExtractor = useCallback((item) => item.id, []);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {itensPorMes.length === 0 ? (
        <View style={styles.vazioContainer}>
          <Text style={[styles.vazio, { color: colors.text }]}>
            Você não parcelou nada, ainda 😄.
          </Text>
        </View>
      ) : (
        <SectionList
          sections={itensPorMes}
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

export default ItemByMonth;

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
    marginBottom: 0,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
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
    marginTop: 8,
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
