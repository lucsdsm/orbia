import React, { useState } from "react";
import { View, Text, StyleSheet, Animated, Pressable } from "react-native";
import { Feather } from "@expo/vector-icons";

export default function Actions({ colors, onNovoItem }) {
  const [aberto, setAberto] = useState(false);
  const animacao = useState(new Animated.Value(0))[0];

  const toggleMenu = () => {
    const toValue = aberto ? 0 : 1;
    
    if (!aberto) {
      // Abrindo: primeiro mostra, depois anima
      setAberto(true);
      Animated.spring(animacao, {
        toValue,
        useNativeDriver: true,
        friction: 6,
        tension: 40,
      }).start();
    } else {
      // Fechando: primeiro anima, depois esconde
      Animated.spring(animacao, {
        toValue,
        useNativeDriver: true,
        friction: 6,
        tension: 40,
      }).start(() => {
        setAberto(false);
      });
    }
  };

  const handleAction = (tipo) => {
    Animated.spring(animacao, {
      toValue: 0,
      useNativeDriver: true,
      friction: 6,
    }).start(() => {
      setAberto(false);
      if (onNovoItem) onNovoItem(tipo);
    });
  };

  const translateReceita = animacao.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -90],
  });

  const translateDespesa = animacao.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -30],
  });

  const opacity = animacao;
  const scale = animacao;

  return (
    <View style={styles.container}>
      {/* Botão Receita - só renderiza quando aberto */}
      {aberto && (
        <Animated.View
          style={[
            styles.acao,
            {
              transform: [
                { translateY: translateReceita },
                { scale },
              ],
              opacity,
            },
          ]}
        >
          <Pressable
            style={({ pressed }) => [
              styles.botaoAcao,
              { 
                backgroundColor: "#4CAF50",
                opacity: pressed ? 0.8 : 1, 
              }
            ]}
            onPress={() => handleAction("Receita")}
          >
            <Feather name="arrow-up-circle" size={20} color="#fff" />
            <Text style={styles.textoAcao}>Receita</Text>
          </Pressable>
        </Animated.View>
      )}

      {/* Botão Despesa - só renderiza quando aberto */}
      {aberto && (
        <Animated.View
          style={[
            styles.acao,
            {
              transform: [
                { translateY: translateDespesa },
                { scale },
              ],
              opacity,
            },
          ]}
        >
          <Pressable
            style={({ pressed }) => [
              styles.botaoAcao,
              { 
                backgroundColor: "#F44336",
                opacity: pressed ? 0.8 : 1, 
              }
            ]}
            onPress={() => handleAction("Despesa")}
          >
            <Feather name="arrow-down-circle" size={20} color="#fff" />
            <Text style={styles.textoAcao}>Despesa</Text>
          </Pressable>
        </Animated.View>
      )}

      {/* Botão principal (+) */}
      <Pressable
        style={({ pressed }) => [
          styles.botaoPrincipal,
          { 
            backgroundColor: colors.text,
            transform: [{ scale: pressed ? 0.95 : 1 }], 
          }
        ]}
        onPress={toggleMenu}
      >
        <Feather
          name={aberto ? "x" : "plus"}
          size={24}
          color={colors.background}
        />
      </Pressable>
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