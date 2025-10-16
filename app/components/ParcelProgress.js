import React, { useMemo } from "react";
import { View, Text, StyleSheet } from "react-native";
import { useTheme } from "../ThemeContext";
import Svg, { Circle } from "react-native-svg";

export default function ParcelProgress({ dataCompra, totalParcelas, cor }) {
  const { colors } = useTheme();

  const { parcelasPagas, progresso } = useMemo(() => {
    if (!dataCompra || !totalParcelas) return { parcelasPagas: 0, progresso: 0 };

    const [dia, mes, ano] = dataCompra.split("/").map(Number);
    const dataInicial = new Date(ano, mes - 1, dia);
    const hoje = new Date();

    let diffMeses =
      (hoje.getFullYear() - dataInicial.getFullYear()) * 12 +
      (hoje.getMonth() - dataInicial.getMonth());

    if (hoje.getDate() < dataInicial.getDate()) diffMeses--;

    const pagas = Math.min(totalParcelas, Math.max(0, diffMeses + 1));
    const porcentagem = (pagas / totalParcelas) * 100;

    return { parcelasPagas: pagas, progresso: porcentagem };
  }, [dataCompra, totalParcelas]);

  const concluido = parcelasPagas >= totalParcelas;

  // configurações do círculo
  const size = 32; 
  const strokeWidth = 3;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (progresso / 100) * circumference;

  // ✅ Cores corrigidas - opacidade no formato rgba()
  const corBase = cor || colors.background;
  
  // Converte hex para rgba com opacidade
  const hexToRgba = (hex, opacity) => {
    // Remove # se existir
    hex = hex.replace('#', '');
    
    // Converte para RGB
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
  };

  const corFundo = hexToRgba(corBase, 0.3); // 30% de opacidade
  const corProgresso = concluido ? "#4CAF50" : corBase;

  return (
    <View style={styles.container}>
      {/* círculo de progresso svg */}
      <View style={styles.circleContainer}>
        <Svg width={size} height={size} style={styles.svg}>
          {/* círculo de fundo */}
          <Circle
            stroke={corFundo}
            fill="none"
            cx={size / 2}
            cy={size / 2}
            r={radius}
            strokeWidth={strokeWidth}
          />
          {/* círculo de progresso */}
          <Circle
            stroke={corProgresso}
            fill="none"
            cx={size / 2}
            cy={size / 2}
            r={radius}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            rotation="-90"
            origin={`${size / 2}, ${size / 2}`}
          />
        </Svg>
        
        {/* texto no centro do círculo */}
        <Text style={[styles.centerText, { color: corBase }]}>
          {`${parcelasPagas}/${totalParcelas}`}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  circleContainer: {
    position: "relative",
    justifyContent: "center",
    alignItems: "center",
  },
  svg: {
    transform: [{ rotate: "0deg" }],
  },
  centerText: {
    position: "absolute",
    fontSize: 10,
    fontWeight: "700",
  },
});