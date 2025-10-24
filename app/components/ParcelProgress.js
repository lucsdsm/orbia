import React, { useMemo } from "react";
import { View, Text, StyleSheet } from "react-native";
import { useTheme } from "../contexts/ThemeContext";
import Svg, { Circle } from "react-native-svg";
import { calcularParcelasPagas } from "../utils/calculations";
import { hexToRgba } from "../utils/formatters";

/**
 * Componente que exibe o progresso das parcelas de um item.
*/
export default function ParcelProgress({ mesPrimeiraParcela, anoPrimeiraParcela, totalParcelas, cor }) {
  const { colors } = useTheme();

  const { parcelasPagas, progresso } = useMemo(() => {
    if (!mesPrimeiraParcela || !anoPrimeiraParcela || !totalParcelas) {
      return { parcelasPagas: 0, progresso: 0 };
    }

    const pagas = Math.min(
      totalParcelas, 
      Math.max(0, calcularParcelasPagas(mesPrimeiraParcela, anoPrimeiraParcela) + 1)
    );
    const porcentagem = (pagas / totalParcelas) * 100;

    return { parcelasPagas: pagas, progresso: porcentagem };
  }, [mesPrimeiraParcela, anoPrimeiraParcela, totalParcelas]);

  const concluido = parcelasPagas >= totalParcelas;

  // Configurações do círculo
  const size = 32;
  const strokeWidth = 3;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDashoffset = circumference - (progresso / 100) * circumference;

  // Cores
  const corBase = cor || colors.background;
  const corFundo = hexToRgba(corBase, 0.3);
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