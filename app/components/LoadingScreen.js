import React, { useEffect, useRef } from "react";
import { View, Text, StyleSheet, Animated } from "react-native";
import { useTheme } from "../contexts/ThemeContext";

export default function LoadingScreen() {
  const { colors } = useTheme();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const progressAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // animação de fade in e escala
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1800,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();

    // animação da barra de progresso - vai de 0 a 100% em 1.5s
    Animated.timing(progressAnim, {
      toValue: 1,
      duration: 1500, // mesmo tempo do minLoadingTime do ItensContext
      useNativeDriver: false,
    }).start();
  }, []);

  const progressWidth = progressAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0%", "100%"],
  });

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Animated.View
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ scale: scaleAnim }],
          },
        ]}
      >
        <Text style={[styles.logo, { color: colors.text }]}> Orbia </Text>
        <View style={[styles.loadingBar, { backgroundColor: colors.text + '20' }]}>
          <Animated.View 
            style={[
              styles.loadingProgress, 
              { 
                backgroundColor: colors.text,
                width: progressWidth,
              }
            ]} 
          />
        </View>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  content: {
    alignItems: "center",
  },
  logo: {
    fontSize: 48,
    fontWeight: "300",
    letterSpacing: 4,
    marginBottom: 32,
  },
  loadingBar: {
    width: 200,
    height: 4,
    borderRadius: 2,
    overflow: "hidden",
  },
  loadingProgress: {
    height: "100%",
    borderRadius: 2,
  },
});
