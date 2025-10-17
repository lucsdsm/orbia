import React from "react";
import { View, Animated, StyleSheet } from "react-native";
import { useTheme } from "../ThemeContext";

export default function Indicator({ scrollX, totalPages }) {
  const { colors } = useTheme();
  
  // Largura fixa da barra (150px como no Header)
  const containerWidth = 150;
  const indicatorWidth = containerWidth / totalPages;

  const translateX = scrollX.interpolate({
    inputRange: [0, 150 * (totalPages - 1)],
    outputRange: [0, containerWidth - indicatorWidth],
    extrapolate: "clamp",
  });

  return (
    <View style={styles.container}>
      <View style={[styles.track, { width: containerWidth, backgroundColor: colors.text + '30' }]} />
      <Animated.View
        style={[
          styles.indicator,
          {
            width: indicatorWidth,
            backgroundColor: colors.text,
            transform: [{ translateX }],
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 4,
    marginTop: 8,
    justifyContent: "center",
  },
  track: {
    height: 4,
    borderRadius: 2,
  },
  indicator: {
    height: 4,
    borderRadius: 2,
    position: "absolute",
    left: 0,
  },
});