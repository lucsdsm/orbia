import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
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
  const scrollViewRef = useRef(null);

  useFocusEffect(
    useCallback(() => {
      recarregarItens();
    }, [recarregarItens])
  );

  // Animação removida para evitar piscar durante o scroll horizontal

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

  // Dimensões do donut minimalista
  const pieWidth = screenWidth - 40;
  const pieHeight = 220;
  const pieDiameter = Math.min(pieWidth, pieHeight);
  const innerRadius = Math.round(pieDiameter * 0.6); // 60% = buraco grande, apenas bordas visíveis
  // Calcula padding dinâmico para centralizar o gráfico em qualquer tela
  const dynamicPaddingLeft = Math.round((pieWidth - pieDiameter) / 2) + 15.5;

  // Dados do gráfico de pizza (Receitas vs Despesas)
  const pieChartData = useMemo(() => {
    const total = totalReceitas || 1; // Evita divisão por zero

    // Arredondar os valores o gráfico ficar mais legível
    const percentualGasto = Math.round((totalDespesas / total) * 1000) / 10;
    const percentualRestante = Math.max(0, Math.round((100 - percentualGasto) * 10) / 10);

    return [
      {
        name: 'Disponível',
        population: Math.max(percentualRestante, 0),
        color: '#4CAF50',
        legendFontColor: colors.text,
        legendFontSize: 12,
      },
      {
        name: 'Gasto',
        population: Math.min(percentualGasto, 100),
        color: '#F44336',
        legendFontColor: colors.text,
        legendFontSize: 12,
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

  // Config minimalista para barras (roxa vibrante, sem linhas horizontais)
  const barChartConfig = {
    backgroundColor: colors.background,
    backgroundGradientFrom: colors.background,
    backgroundGradientTo: colors.background,
    color: (opacity = 1) => `rgba(138, 43, 226, ${opacity})`, // Roxo vibrante (BlueViolet)
    labelColor: (opacity = 1) => colors.text,
    barPercentage: 0.6,
    decimalPlaces: 0,
    // Estilo dos valores ACIMA das barras (R$ 150, R$ 200, etc.)
    propsForLabels: {
      fontSize: 15,
      fontWeight: 'bold',
      fill: '#8A2BE2', // Roxo vibrante para destacar
    },
    propsForBackgroundLines: {
      strokeWidth: 0, // Remove linhas horizontais
    },
    fillShadowGradient: '#8A2BE2', // Roxo vibrante
    fillShadowGradientOpacity: 1,
    barRadius: 8, // Cantos arredondados no topo
    // Estilo dos rótulos ABAIXO das barras (Jan, Fev, Mar, etc.)
    propsForVerticalLabels: {
      fontSize: 11,
      fontWeight: 'normal',
      fill: colors.text, // Cor do tema
    },
  };

  // Função para detectar mudança de página no scroll
  const handleScrollEnd = (event) => {
    const scrollPosition = event.nativeEvent.contentOffset.x;
    const pageWidth = screenWidth;
    const currentPage = Math.round(scrollPosition / pageWidth);
    if (currentPage !== activeChart) {
      setActiveChart(currentPage);
    }
  };

  // Função para trocar gráfico via botões (com scroll automático)
  const handleChartChange = (chartIndex) => {
    setActiveChart(chartIndex);
    scrollViewRef.current?.scrollTo({
      x: chartIndex * screenWidth,
      animated: true,
    });
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Navegação de gráficos */}
      <View style={[styles.navigation, { backgroundColor: colors.background }]}>
        {charts.map((chart) => (
          <TouchableOpacity
            key={chart.id}
            style={[
              styles.navButton,
              activeChart === chart.id && { borderBottomColor: '#820AD1', borderBottomWidth: 3 },
            ]}
            onPress={() => handleChartChange(chart.id)}
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
      <ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleScrollEnd}
        contentContainerStyle={[styles.content, { justifyContent: 'center'}]}
      >
        {/* Página 1: Gráfico de Pizza */}
        <View style={{ width: screenWidth, alignItems: 'center', justifyContent: 'center' }}>
          <View style={[styles.chartContainer]}>
            <Text style={[styles.chartTitle, { color: colors.text }]}>Proporção de Receitas e Despesas</Text>
            <Text style={[styles.chartSubtitle, { color: colors.text }]}>Receitas: R$ {totalReceitas.toFixed(2)} | Despesas: R$ {totalDespesas.toFixed(2)}</Text>

            {/* Área ampla (largura da tela - padding) para o PieChart, com overflow oculto para mostrar só o centro circular */}
            <View style={{ width: pieWidth, height: pieHeight, alignItems: 'center', justifyContent: 'center', overflow: 'hidden', position: 'relative' }}>
              {/* PieChart usa a largura total disponível (pieWidth) para evitar corte à esquerda */}
              <PieChart
                data={pieChartData}
                width={pieWidth}
                height={pieHeight}
                chartConfig={chartConfig}
                accessor="population"
                backgroundColor="transparent"
                paddingLeft={dynamicPaddingLeft}
                hasLegend={false}
                style={{ alignSelf: 'center' }}
              />

              {/* Centro branco (donut) posicionado no centro do container amplo */}
              <View
                style={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  width: innerRadius,
                  height: innerRadius,
                  borderRadius: innerRadius / 2,
                  backgroundColor: colors.background,
                  marginTop: -innerRadius / 2,
                  marginLeft: -innerRadius / 2,
                }}
              />
            </View>

            {/* Legendas customizadas abaixo do gráfico */}
            <View style={{ flexDirection: 'row', marginTop: 20, justifyContent: 'center', gap: 30 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <View style={{ width: 12, height: 12, borderRadius: 2, backgroundColor: '#4CAF50' }} />
                <Text style={{ color: colors.text, fontSize: 12 }}>
                  {pieChartData[0].name}: {pieChartData[0].population.toFixed(1)}%
                </Text>
              </View>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <View style={{ width: 12, height: 12, borderRadius: 2, backgroundColor: '#F44336' }} />
                <Text style={{ color: colors.text, fontSize: 12 }}>
                  {pieChartData[1].name}: {pieChartData[1].population.toFixed(1)}%
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Página 2: Gráfico de Barras */}
        <View style={{ width: screenWidth, alignItems: 'center', justifyContent: 'center' }}>
          <View style={[styles.chartContainer]}>
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
              chartConfig={barChartConfig}
              style={styles.chart} 
              showValuesOnTopOfBars
              fromZero
              yAxisLabel="R$ "
              yAxisSuffix=""
              segments={4}
              withHorizontalLabels={true}
              withVerticalLabels={true}
            />
          </View>
        </View>
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
    padding: 10,
    paddingHorizontal: 25,
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

