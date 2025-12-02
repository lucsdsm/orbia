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

  // agrupa despesas por cartão (parceladas + fixas)
  const itensPorCartao = useMemo(() => {
    const despesasComCartao = itens.filter(
      (item) => item.natureza === "despesa" && (item.tipo === "parcelada" || item.tipo === "fixa") && (item.cartaoId || item.cartao)
    );

    const grupos = {};
    const hoje = new Date();
    const mesAtual = hoje.getMonth() + 1;
    const anoAtual = hoje.getFullYear();

    despesasComCartao.forEach((item) => {
      const cartaoId = item.cartaoId || item.cartao;
      
      if (!grupos[cartaoId]) {
        grupos[cartaoId] = {
          cartao: cartaoId,
          itens: [],
          totalGeral: 0, // total de todas as parcelas restantes
          totalMesAtual: 0, // total apenas das parcelas do mês atual
        };
      }

      grupos[cartaoId].itens.push(item);
      
      // Para despesas fixas, adiciona o valor integral
      if (item.tipo === "fixa") {
        grupos[cartaoId].totalGeral += parseFloat(item.valor);
        grupos[cartaoId].totalMesAtual += parseFloat(item.valor);
      } else {
        // Para parceladas, calcula normalmente
        const gastoTotal = calcularGastoItem(item);
        grupos[cartaoId].totalGeral += gastoTotal;

        // Calcula se o item tem parcela no mês atual
        const mesPrimeiraParcela = item.mesPrimeiraParcela || item.mes_primeira_parcela;
        const anoPrimeiraParcela = item.anoPrimeiraParcela || item.ano_primeira_parcela;
        
        if (mesPrimeiraParcela && anoPrimeiraParcela && item.parcelas) {
          const mesesPassados = (anoAtual - anoPrimeiraParcela) * 12 + (mesAtual - mesPrimeiraParcela);
          const parcelaAtual = mesesPassados + 1;
          
          // Se a parcela atual está dentro do range válido, adiciona ao total do mês
          if (parcelaAtual >= 1 && parcelaAtual <= parseInt(item.parcelas)) {
            grupos[cartaoId].totalMesAtual += parseFloat(item.valor);
          }
        }
      }
    });

    // converte para array e ordena por total do mês atual
    const sections = Object.values(grupos)
      .sort((a, b) => b.totalMesAtual - a.totalMesAtual)
      .map((grupo) => {
        const cartaoInfo = cartoes.find((c) => c.id === grupo.cartao);

        // Ordena os itens: fixas primeiro, depois parceladas por parcelas restantes
        const itensOrdenados = grupo.itens.slice().sort((a, b) => {
          // Despesas fixas vêm primeiro
          if (a.tipo === "fixa" && b.tipo === "parcelada") return -1;
          if (a.tipo === "parcelada" && b.tipo === "fixa") return 1;
          
          // Se ambas são fixas, ordena por valor (maior primeiro)
          if (a.tipo === "fixa" && b.tipo === "fixa") {
            return parseFloat(b.valor) - parseFloat(a.valor);
          }
          
          // Se ambas são parceladas, ordena por parcelas restantes (menor primeiro)
          const hoje = new Date();
          
          const mesPrimeiraParcelaA = a.mesPrimeiraParcela || a.mes_primeira_parcela;
          const anoPrimeiraParcelaA = a.anoPrimeiraParcela || a.ano_primeira_parcela;
          const mesesPassadosA = (hoje.getFullYear() - anoPrimeiraParcelaA) * 12 + (hoje.getMonth() + 1 - mesPrimeiraParcelaA);
          const parcelasRestantesA = Math.max(0, parseInt(a.parcelas) - mesesPassadosA);

          const mesPrimeiraParcelaB = b.mesPrimeiraParcela || b.mes_primeira_parcela;
          const anoPrimeiraParcelaB = b.anoPrimeiraParcela || b.ano_primeira_parcela;
          const mesesPassadosB = (hoje.getFullYear() - anoPrimeiraParcelaB) * 12 + (hoje.getMonth() + 1 - mesPrimeiraParcelaB);
          const parcelasRestantesB = Math.max(0, parseInt(b.parcelas) - mesesPassadosB);

          return parcelasRestantesA - parcelasRestantesB;
        });

        return {
          title: cartaoInfo ? `${cartaoInfo.emoji} ${cartaoInfo.nome}` : grupo.cartao,
          cartao: grupo.cartao,
          totalMesAtual: grupo.totalMesAtual,
          totalGeral: grupo.totalGeral,
          color: cartaoInfo?.cor || cartaoInfo?.color || "gray",
          data: itensOrdenados,
        };
      });

    return sections;
  }, [itens, cartoes]);

  const renderItem = useCallback(({ item }) => {
    const cartaoData = item.cartaoId ? cartoes.find(c => c.id === item.cartaoId) : (item.cartao ? cartoes.find(c => c.id === item.cartao) : null);
    const corBorda = item.tipo === "fixa" ? "#820AD1" : "#F44336"; // Roxo para fixa, vermelho para parcelada
    
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
          <Text style={[styles.descricao, { color: colors.text }]}>
            {item.categoria || item.emoji} {item.nome || item.descricao}
          </Text>

          <View style={styles.valorRow}>
            <Text style={[styles.valor, { color: colors.text }]}>
              R$ {formatCurrency(item.valor)}
            </Text>

            {item.tipo === "parcelada" && (item.mesPrimeiraParcela || item.mes_primeira_parcela) && (item.anoPrimeiraParcela || item.ano_primeira_parcela) && item.parcelas && (
              <ParcelProgress
                mesPrimeiraParcela={item.mesPrimeiraParcela || item.mes_primeira_parcela}
                anoPrimeiraParcela={item.anoPrimeiraParcela || item.ano_primeira_parcela}
                totalParcelas={item.parcelas}
                cor={colors.text}
              />
            )}
            
            {item.tipo === "fixa" && (
              <Text style={[styles.tipoTag, { color: colors.textSecondary }]}>
                Fixa
              </Text>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  }, [colors, navigation, recarregarItens, cartoes]);

  const renderSectionHeader = useCallback(({ section: { title, totalMesAtual, totalGeral, cartao, color } }) => {
    const cartaoInfo = cartoes.find((c) => c.id === cartao);
    const limite = cartaoInfo?.limite || 0;
    const percentualUtilizado = calcularPercentualLimite(totalGeral, limite);

    return (
      <View style={[styles.sectionHeader, { backgroundColor: colors.background }]}>
        <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
          <View
            style={{
              backgroundColor: color,
              paddingHorizontal: 12,
              paddingVertical: 6,
              borderRadius: 20,
              width: '40%',
            }}
          >
            <Text style={{ color: "#FFFFFF", fontSize: 14, fontWeight: "bold" }}>
              {title}
            </Text>
          </View>
          <Text style={[styles.sectionTotal, { color: colors.text }, { fontSize: 16 }]}>
            R$ {formatCurrency(totalMesAtual)} este mês
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
            Nenhuma despesa com cartão cadastrada 💳
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
  tipoTag: {
    fontSize: 12,
    fontWeight: "600",
    opacity: 0.7,
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
