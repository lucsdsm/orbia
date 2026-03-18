import React, { useState, useMemo, useCallback, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { PieChart, BarChart } from 'react-native-chart-kit';
import { useTheme } from '../contexts/ThemeContext';
import { useItens } from '../contexts/ItensContext';
import { useCartoes } from '../contexts/CartoesContext';
import { useFocusEffect } from '@react-navigation/native';

const screenWidth = Dimensions.get('window').width;
const screenHeight = Dimensions.get('window').height;

const radius = 6;

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

  const { totalReceitas, totalDespesas } = useMemo(() => {
    let receitas = 0;
    let despesas = 0;
    if (Array.isArray(itens)) {
      itens.forEach((item) => {
        const valor = Number(item.valor) || 0;
        if (item.natureza === 'receita') receitas += valor;
        else if (item.natureza === 'despesa') despesas += valor;
      });
    }
    return { totalReceitas: receitas, totalDespesas: despesas };
  }, [itens]);

  const saldo = totalReceitas - totalDespesas;
  const pctGasto = totalReceitas > 0
    ? Math.min(Math.round((totalDespesas / totalReceitas) * 1000) / 10, 100)
    : 0;
  const pctDisponivel = Math.max(Math.round((100 - pctGasto) * 10) / 10, 0);

  const pieWidth = screenWidth - 48;
  const pieHeight = 200;
  const pieDiameter = Math.min(pieWidth, pieHeight);
  const innerRadius = Math.round(pieDiameter * 0.62);
  const dynamicPaddingLeft = Math.round((pieWidth - pieDiameter) / 2) + 9.0;

  const PIE_INCOME = colors.text;           // cor para "disponível"
  const PIE_EXPENSE = colors.text + '30';   // mesma cor mas com opacidade

  const pieChartData = useMemo(() => [
    {
      name: 'Disponível',
      population: Math.max(pctDisponivel, 0),
      color: PIE_INCOME,
      legendFontColor: colors.text,
      legendFontSize: 12,
    },
    {
      name: 'Gasto',
      population: Math.min(pctGasto, 100),
      color: PIE_EXPENSE,
      legendFontColor: colors.text,
      legendFontSize: 12,
    },
  ], [pctDisponivel, pctGasto, colors.text]);

  const barChartData = useMemo(() => {
    const hoje = new Date();
    const anoAtual = hoje.getFullYear();
    const mesAtual = hoje.getMonth() + 1;

    const meses = [];
    for (let i = 0; i < 6; i++) {
      let mes = mesAtual + i;
      let ano = anoAtual;
      if (mes > 12) { mes -= 12; ano += 1; }
      meses.push({ mes, ano });
    }

    const totaisPorMes = meses.map(({ mes, ano }) => {
      let total = 0;
      itens
        .filter((item) => item.tipo === 'parcelada' && item.natureza === 'despesa')
        .forEach((item) => {
          const mesI = item.mesPrimeiraParcela || item.mes_primeira_parcela;
          const anoI = item.anoPrimeiraParcela || item.ano_primeira_parcela;
          if (!mesI || !anoI || !item.parcelas) return;
          const dataInicio = new Date(anoI, mesI - 1, 1);
          const dataFim = new Date(anoI, mesI - 1 + item.parcelas, 0);
          const dataCheck = new Date(ano, mes - 1, 1);
          if (dataCheck >= dataInicio && dataCheck <= dataFim)
            total += parseFloat(item.valor) || 0;
        });
      return total;
    });

    const nomesMeses = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];
    return {
      labels: meses.map(({ mes }) => nomesMeses[mes - 1]),
      datasets: [{ data: totaisPorMes.map((v) => Math.round(Math.max(v, 0) * 100) / 100) }],
    };
  }, [itens]);

  const pieConfig = {
    backgroundColor: 'transparent',
    backgroundGradientFrom: colors.background,
    backgroundGradientTo: colors.background,
    color: (opacity = 1) => colors.text,
    labelColor: () => colors.text,
    decimalPlaces: 0,
  };

  const barConfig = {
    backgroundColor: 'transparent',
    backgroundGradientFrom: colors.background,
    backgroundGradientTo: colors.background,
    color: (opacity = 1) => `${colors.text}${Math.round(opacity * 255).toString(16).padStart(2, '0')}`,
    labelColor: () => colors.text,
    barPercentage: 0.45,
    decimalPlaces: 0,
    propsForLabels: { fontSize: 11, fontWeight: '500' },
    propsForBackgroundLines: { strokeWidth: 0 },
    fillShadowGradient: colors.text,
    fillShadowGradientOpacity: 1,
    propsForVerticalLabels: { fontSize: 12, fontWeight: '400', fill: colors.text },
    barRadius: radius,
  };

  const handleScrollEnd = (e) => {
    const page = Math.round(e.nativeEvent.contentOffset.x / screenWidth);
    if (page !== activeChart) setActiveChart(page);
  };

  const handleChartChange = (index) => {
    setActiveChart(index);
    scrollViewRef.current?.scrollTo({ x: index * screenWidth, animated: true });
  };

  const tabs = [
    { id: 0, label: 'Receitas vs Despesas' },
    { id: 1, label: 'Evolução Mensal' },
  ];

  const formatCurrency = (value) =>
    value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>

      <View style={[styles.tabBar, { borderBottomColor: colors.text + '15' }]}>
        {tabs.map((tab) => {
          const active = activeChart === tab.id;
          return (
            <TouchableOpacity
              key={tab.id}
              style={styles.tab}
              onPress={() => handleChartChange(tab.id)}
              activeOpacity={0.6}
            >
              <Text style={[styles.tabText, { color: active ? colors.text : colors.text + '45' }]}>
                {tab.label}
              </Text>
              {active && (
                <View style={[styles.tabIndicator, { backgroundColor: colors.text }]} />
              )}
            </TouchableOpacity>
          );
        })}
      </View>

      <ScrollView
        ref={scrollViewRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onMomentumScrollEnd={handleScrollEnd}
        contentContainerStyle={styles.scrollContent}
      >

        {/* donut */}
        <View style={[styles.page, { width: screenWidth }]}>
          {/* totais em cards simples */}
          <View style={styles.statsRow}>
            <StatCard
              label="Receitas"
              value={formatCurrency(totalReceitas)}
              accent={colors.text}
              colors={colors}
            />
            <View style={[styles.statDivider, { backgroundColor: colors.text + '15' }]} />
            <StatCard
              label="Despesas"
              value={formatCurrency(totalDespesas)}
              accent={colors.text + '70'}
              colors={colors}
            />
          </View>

          {/* donut */}
          <View style={styles.donutWrapper}>
            <View style={{ width: pieWidth, height: pieHeight, overflow: 'hidden', position: 'relative', alignItems: 'center', justifyContent: 'center' }}>
              <PieChart
                data={pieChartData}
                width={pieWidth}
                height={pieHeight}
                chartConfig={pieConfig}
                accessor="population"
                backgroundColor="transparent"
                paddingLeft={dynamicPaddingLeft}
                hasLegend={false}
                style={{ alignSelf: 'center' }}
              />
              {/* buraco do donut */}
              <View
                style={{
                  position: 'absolute',
                  top: '50%', left: '50%',
                  width: innerRadius, height: innerRadius,
                  borderRadius: innerRadius / 2,
                  backgroundColor: colors.background,
                  marginTop: -innerRadius / 2,
                  marginLeft: -innerRadius / 2,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {/* percentual central */}
                <Text style={[styles.donutPct, { color: colors.text }]}>
                  {pctGasto.toFixed(0)}%
                </Text>
                <Text style={[styles.donutLabel, { color: colors.text + '60' }]}>gasto</Text>
              </View>
            </View>
          </View>

          {/* legenda */}
          <View style={styles.legendRow}>
            <LegendItem color={PIE_INCOME} label="Disponível" value={`${pctDisponivel.toFixed(1)}%`} colors={colors} />
            <LegendItem color={PIE_EXPENSE} label="Gasto" value={`${pctGasto.toFixed(1)}%`} colors={colors} />
          </View>

          {/* saldo */}
          <View style={[styles.saldoContainer, { borderColor: colors.text + '15' }]}>
            <Text style={[styles.saldoLabel, { color: colors.text + '55' }]}>Saldo</Text>
            <Text style={[styles.saldoValue, { color: colors.text }]}>{formatCurrency(saldo)}</Text>
          </View>
        </View>

        {/* evolução mensal */}
        <View style={[styles.page, { width: screenWidth, justifyContent: 'center', paddingBottom: 60 }]}>
      
          <Text style={[styles.pageSubtitle, { color: colors.text + '55', alignSelf: 'center', marginBottom: 32 }]}>
            Próximos 6 meses
          </Text>
          
          <View style={styles.valuesList}>
            {barChartData.labels.map((label, index) => (
              <View key={index} style={styles.valueItem}>
                <Text style={[styles.valueLabel, { color: colors.text + '40' }]}>{label}</Text>
                <Text style={[styles.valueAmount, { color: colors.text }]}>
                  {formatCurrency(barChartData.datasets[0].data[index])}
                </Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </View>
  );
});

const StatCard = ({ label, value, accent, colors }) => (
  <View style={styles.statCard}>
    <View style={[styles.statDot, { backgroundColor: accent }]} />
    <Text style={[styles.statLabel, { color: colors.text + '55' }]}>{label}</Text>
    <Text style={[styles.statValue, { color: colors.text }]}>{value}</Text>
  </View>
);

const LegendItem = ({ color, label, value, colors }) => (
  <View style={styles.legendItem}>
    <View style={[styles.legendSwatch, { backgroundColor: color }]} />
    <Text style={[styles.legendText, { color: colors.text + '80' }]}>{label}</Text>
    <Text style={[styles.legendValue, { color: colors.text }]}>{value}</Text>
  </View>
);

export default Charts;

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  tabBar: {
    flexDirection: 'row',
    marginTop: 16,
    marginHorizontal: 24,
    borderBottomWidth: 1,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    paddingBottom: 12,
    paddingTop: 4,
    position: 'relative',
  },
  tabText: {
    fontSize: 13,
    letterSpacing: 0.2,
    fontWeight: '500',
  },
  tabIndicator: {
    position: 'absolute',
    bottom: -1,
    height: 2,
    width: '60%',
    borderRadius: 2,
  },

  scrollContent: {
    alignItems: 'flex-start',
  },
  page: {
    paddingHorizontal: 24,
    paddingTop: 28,
    alignItems: 'center',
  },

  statsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    marginBottom: 28,
  },
  statCard: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  statDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 11,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  statValue: {
    fontSize: 18,
    fontWeight: '600',
    letterSpacing: -0.5,
  },
  statDivider: {
    width: 1,
    height: 36,
    marginHorizontal: 12,
  },

  donutWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  donutPct: {
    fontSize: 28,
    fontWeight: '700',
    letterSpacing: -1,
  },
  donutLabel: {
    fontSize: 11,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    marginTop: -2,
  },

  legendRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 32,
    marginTop: 24,
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  legendSwatch: {
    width: 8,
    height: 8,
    borderRadius: 2,
  },
  legendText: {
    fontSize: 12,
  },
  legendValue: {
    fontSize: 12,
    fontWeight: '600',
  },

  saldoContainer: {
    marginTop: 24,
    width: '100%',
    borderTopWidth: 1,
    paddingTop: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  saldoLabel: {
    fontSize: 12,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  saldoValue: {
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: -0.5,
  },

  pageTitle: {
    fontSize: 22,
    fontWeight: '700',
    letterSpacing: -0.5,
    alignSelf: 'flex-start',
  },
  pageSubtitle: {
    fontSize: 13,
    alignSelf: 'flex-start',
    marginTop: 4,
    letterSpacing: 0.2,
  },

  valuesList: {
    width: '100%',
    paddingHorizontal: 20,
    gap: 16,
  },
  valueItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    paddingVertical: 8,
    borderBottomWidth: 0.5,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  valueLabel: {
    fontSize: 16,
    fontWeight: '400',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  valueAmount: {
    fontSize: 20,
    fontWeight: '600',
  },
});
