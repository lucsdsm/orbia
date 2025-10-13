import React, { useState, useEffect, useCallback, useMemo } from "react";
import { View, StyleSheet } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useTheme } from "../ThemeContext";
import { useFocusEffect } from "@react-navigation/native";

import Superavite from "../components/Superavite";
import Balance from "../components/Balance";
import NextBalance from "../components/NextBalance";

export default function Home({ navigation }) {
  const { colors } = useTheme();
  const [itens, setItens] = useState([]);
  const [diferenca, setDiferenca] = useState(0);

  const carregarItens = useCallback(async () => {
    try {
      const itensExistentes = await AsyncStorage.getItem("itens");
      if (itensExistentes) {
        const itensCarregados = JSON.parse(itensExistentes);
        console.log("Itens carregados:", itensCarregados.length);
        setItens(itensCarregados);
      } else {
        setItens([]);
      }
    } catch (error) {
      console.error("Erro ao carregar itens:", error);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      console.log("Home recebeu foco - recarregando itens...");
      carregarItens();
    }, [carregarItens])
  );

  const superavite = useMemo(() => {
    let receita = 0;
    let despesa = 0;

    if (!Array.isArray(itens)) return 0;

    itens.forEach((item) => {
      const valor = Number(item.valor) || 0;
      if (item.natureza === "Receita") receita += valor;
      else if (item.natureza === "Despesa") despesa += valor;
    });

    return receita - despesa;
  }, [itens]);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Superavite itens={itens} />
      <Balance itens={itens} diferenca={diferenca} setDiferenca={setDiferenca} />
      <NextBalance saldoAtual={diferenca} superavite={superavite} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "space-around",
  },
});