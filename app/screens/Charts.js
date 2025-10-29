import React, { useState, useMemo, useCallback } from 'react';
import { View, Text, StyleSheet, Dimensions, TouchableOpacity, ScrollView } from 'react-native';
import { PieChart, BarChart } from 'react-native-chart-kit';
import { useTheme } from '../contexts/ThemeContext';
import { useItens } from '../contexts/ItensContext';
import { useCartoes } from '../contexts/CartoesContext';
import { useFocusEffect } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';
import { calcularGastoItem } from '../utils/calculations';

const screenWidth = Dimensions.get('window').width;
const screenHeight = Dimensions.get('window').height;

const Charts = React.memo(() => {
  const { colors } = useTheme();
  const { itens, recarregarItens } = useItens();
  const { cartoes } = useCartoes();
  const [activeChart, setActiveChart] = useState(0);

  useFocusEffect(
    useCallback(() => {
      recarregarItens();
    }, [recarregarItens])
  );

  // Calcula receitas e despesas totais
  const { totalReceitas, totalDespesas } = useMemo(() => {
    let receitas = 0;
    let despesas = 0;

    if (Array.isArray(itens)) {
      itens.forEach((item) => {
        const valor = Number(item.valor) || 0;
        if (item.natureza === 'receita') {
          receitas += valor;
        } else if (item.natureza === 'despesa') {
          despesas += valor;
        }
      });
    }

    return { totalReceitas: receitas, totalDespesas: despesas };
  }, [itens]);

  // Dados do gráfico de pizza (Receitas vs Despesas)
  const pieChartData = useMemo(() => {
    const total = totalReceitas || 1; // Evita divisão por zero

    // Arredondar os valores o gráfico ficar mais legível
    const percentualGasto = Math.round((totalDespesas / total) * 1000) / 10;
    const percentualRestante = Math.max(0, Math.round((100 - percentualGasto) * 10) / 10);

    return [
      {
        name: '% disponível',
        population: Math.max(percentualRestante, 0),
        color: '#4CAF50',
        legendFontColor: colors.text,
        legendFontSize: 14,
      },
      {
        name: '% gasto',
        population: Math.min(percentualGasto, 100),
        color: '#F44336',
        legendFontColor: colors.text,
        legendFontSize: 14,
      },
    ];
  }, [totalReceitas, totalDespesas, colors.text]);

  // Dados do gráfico de barras (Evolução mensal de parcelas)
  const barChartData = useMemo(() => {
    const hoje = new Date();
    const anoAtual = hoje.getFullYear();
    const mesAtual = hoje.getMonth() + 1;

    // Gera próximos 6 meses
    const meses = [];
    for (let i = 0; i < 6; i++) {
      let mes = mesAtual + i;
      let ano = anoAtual;
      
      if (mes > 12) {
        mes = mes - 12;
        ano = ano + 1;
      }
      
      meses.push({ mes, ano });
    }

    // Calcula total de parcelas por mês
    const totaisPorMes = meses.map(({ mes, ano }) => {
      let total = 0;
      
      itens
        .filter(item => item.tipo === 'parcelada' && item.natureza === 'despesa')
        .forEach(item => {
          if (!item.mesPrimeiraParcela || !item.anoPrimeiraParcela || !item.parcelas) return;
          
          // Verifica se este mês/ano está no intervalo de parcelas
          const mesInicio = item.mesPrimeiraParcela;
          const anoInicio = item.anoPrimeiraParcela;
          
          const dataInicio = new Date(anoInicio, mesInicio - 1, 1);
          const dataFim = new Date(anoInicio, mesInicio - 1 + item.parcelas, 0);
          const dataVerificar = new Date(ano, mes - 1, 1);
          
          if (dataVerificar >= dataInicio && dataVerificar <= dataFim) {
            total += parseFloat(item.valor) || 0;
          }
        });
      
      return total;
    });

    const labels = meses.map(({ mes }) => {
      const nomesMeses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
      return nomesMeses[mes - 1];
    });

    return {
      labels,
      datasets: [
        {
          data: totaisPorMes.map(v => Math.round(Math.max(v, 0) * 100) / 100),
        },
      ],
    };
  }, [itens]);

  const charts = [
    {
      id: 0,
      title: 'Receitas vs Despesas',
      icon: 'pie-chart',
    },
    {
      id: 1,
      title: 'Evolução Mensal',
      icon: 'bar-chart',
    },
  ];

  const chartConfig = {
    backgroundColor: colors.background,
    backgroundGradientFrom: colors.card,
    backgroundGradientTo: colors.card,
    color: (opacity = 1) => `rgba(130, 10, 209, ${opacity})`,
    labelColor: (opacity = 1) => colors.text,
    barPercentage: 0.7,
    decimalPlaces: 0,
    propsForLabels: {
      fontSize: 12,
    },
  };

  const renderChart = () => {
    switch (activeChart) {
      case 0:
        return (
          <View style={styles.chartContainer}>
            <Text style={[styles.chartTitle, { color: colors.text }]}>
              Proporção de Receitas e Despesas
            </Text>
            <Text style={[styles.chartSubtitle, { color: colors.text }]}>
              Receitas: R$ {totalReceitas.toFixed(2)} | Despesas: R$ {totalDespesas.toFixed(2)}
            </Text>
            <PieChart
              data={pieChartData}
              width={screenWidth - 40}
              height={220}
              chartConfig={chartConfig}
              accessor="population"
              backgroundColor="transparent"
              paddingLeft="15"
              absolute
            />
          </View>
        );

      case 1:
        return (
          <View style={styles.chartContainer}>
            <Text style={[styles.chartTitle, { color: colors.text }]}>
              Parcelas nos Próximos Meses
            </Text>
            <Text style={[styles.chartSubtitle, { color: colors.text }]}>
              Total de parcelas a pagar por mês
            </Text>
            <BarChart
              data={barChartData}
              width={screenWidth - 40}
              height={screenHeight / 2.5}
              chartConfig={chartConfig}
              style={styles.chart} 
              showValuesOnTopOfBars
              fromZero
              yAxisLabel="R$ "
              yAxisSuffix=""
              segments={5}
            />
          </View>
        );
      default:
        return null;
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Navegação de gráficos */}
      <View style={[styles.navigation, { backgroundColor: colors.card }]}>
        {charts.map((chart) => (
          <TouchableOpacity
            key={chart.id}
            style={[
              styles.navButton,
              activeChart === chart.id && { borderBottomColor: '#820AD1', borderBottomWidth: 3 },
            ]}
            onPress={() => setActiveChart(chart.id)}
            activeOpacity={0.7}
          >
            <MaterialIcons
              name={chart.icon}
              size={24}
              color={activeChart === chart.id ? '#820AD1' : colors.text}
            />
            <Text
              style={[
                styles.navButtonText,
                {
                  color: activeChart === chart.id ? '#820AD1' : colors.text,
                  fontWeight: activeChart === chart.id ? 'bold' : 'normal',
                },
              ]}
            >
              {chart.title}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Gráfico ativo */}
      <ScrollView contentContainerStyle={[styles.content, { justifyContent: 'center'}]}>
        {renderChart()}
      </ScrollView>

    </View>
  );
});

export default Charts;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  navigation: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 15,
  },
  navButton: {
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    flex: 1,
  },
  navButtonText: {
    fontSize: 11,
    marginTop: 4,
    textAlign: 'center',
  },
  content: {
    padding: 20,
    flexGrow: 1,
    alignItems: 'center',
  },
  chartContainer: {
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingVertical: 20, 
    width: '100%',
  },
  chartTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  chartSubtitle: {
    fontSize: 14,
    marginBottom: 20,
    textAlign: 'center',
    opacity: 0.7,
  },
  chart: {
    marginTop: 16,
    alignSelf: 'center',
    borderRadius: 12,
  },
  emptyText: {
    textAlign: 'center',
    fontSize: 16,
    marginTop: 40,
    opacity: 0.6,
  },
});

