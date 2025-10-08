import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Animated } from "react-native";
import { Feather } from "@expo/vector-icons";

import { useNavigation } from "@react-navigation/native";

export default function Actions({ colors }) {
  const [aberto, setAberto] = useState(false);
  const animacao = useState(new Animated.Value(0))[0];
  const navigation = useNavigation();

  const toggleMenu = () => {
    const toValue = aberto ? 0 : 1;
    setAberto(!aberto);
    Animated.spring(animacao, {
      toValue,
      useNativeDriver: true,
      friction: 6,
    }).start();
  };

  const translateReceita = animacao.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -30],
  });

  const translateDespesa = animacao.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -90],
  });

  const opacity = animacao;

  return (
    <View style={styles.container}>
      {/* Botão Receita */}
      {aberto && (
        <Animated.View
          style={[
            styles.acao,
            {
              transform: [{ translateY: translateReceita }],
              opacity,
            },
          ]}
          pointerEvents={aberto ? "auto" : "none"}
        >
          <TouchableOpacity
            style={[styles.botaoAcao, { backgroundColor: "#4CAF50" }]}
            onPress={() => {
              setAberto(false);
              navigation.navigate("ItemAdd", { tipo: "receita" }); // 👈 navega pra tela de cadastro
            }}
          >
            <Feather name="arrow-up-circle" size={20} color="#fff" />
            <Text style={styles.textoAcao}>Receita</Text>
          </TouchableOpacity>
        </Animated.View>
      )}

      {/* Botão Despesa */}
      {aberto && (
        <Animated.View
          style={[
            styles.acao,
            {
              transform: [{ translateY: translateDespesa }],
              opacity,
            },
          ]}
          pointerEvents={aberto ? "auto" : "none"}
        >
          <TouchableOpacity
            style={[styles.botaoAcao, { backgroundColor: "#F44336" }]}
            onPress={() => {
              setAberto(false);
              navigation.navigate("ItemAdd", { tipo: "despesa" }); // 👈 navega pra tela de cadastro
            }}
          >
            <Feather name="arrow-down-circle" size={20} color="#fff" />
            <Text style={styles.textoAcao}>Despesa</Text>
          </TouchableOpacity>
        </Animated.View>
      )}

      {/* Botão principal (+) */}
      <TouchableOpacity
        style={[styles.botaoPrincipal, { backgroundColor: colors.text }]}
        onPress={toggleMenu}
      >
        <Feather
          name={aberto ? "x" : "plus"}
          size={24}
          color={colors.background}
        />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    position: "relative",
  },
  acao: {
    position: "absolute",
    bottom: 60,
    alignItems: "center",
  },
  botaoPrincipal: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    elevation: 1,
    zIndex: 1,
  },
  botaoAcao: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 20,
    paddingHorizontal: 30,
    width: 120,
    paddingVertical: 10,
    elevation: 3,
  },
  textoAcao: {
    color: "#fff",
    marginLeft: 5,
    fontSize: 13,
    fontWeight: "500",
    textAlign: "center",
  },
});
