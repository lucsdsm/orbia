import React, { useState } from "react";
import { View, StyleSheet } from "react-native";
import { useFocusEffect } from "@react-navigation/native";

import { useTheme } from "../ThemeContext";
import Balance from "../components/Balance";
import Superavite from "../components/Superavite";
import NextBalance from "../components/NextBalance";

import { StorageService } from "../services/storage"; 

export default function Home() {
  const { colors } = useTheme();
  const [itens, setItens] = useState([]);

  const carregarItens = async () => {
    try {
      const itensCarregados = await StorageService.getItems();
      setItens(itensCarregados);
    } catch (error) {
      console.log("Erro ao carregar itens:", error);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      carregarItens();
    }, [])
  );

  return (
    <View style={[styles.container, { backgroundColor: colors.secondBackground }]}>
      <View style={[styles.content, { backgroundColor: colors.background }]}>
        <Balance itens={itens} />
        <Superavite itens={itens} />
        <NextBalance itens={itens} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    marginTop: 20,
    padding: 20,
  },
});