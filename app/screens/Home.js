import React, { useState, useEffect, useCallback, useMemo } from "react";
import { View, StyleSheet } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useTheme } from "../contexts/ThemeContext";
import { useItens } from "../contexts/ItensContext";
import { useFocusEffect } from "@react-navigation/native";

import Superavite from "../components/Superavite";
import Balance from "../components/Balance";
import NextBalance from "../components/NextBalance";

export default function Home({ navigation }) {
  const { colors } = useTheme();
  const { itens, recarregarItens } = useItens();
  const [saldoAtual, setSaldoAtual] = useState(0);

  // Carrega o saldo inicial
  useEffect(() => {
    carregarSaldoInicial();
  }, []);

  const carregarSaldoInicial = async () => {
    try {
      const saldoSalvo = await AsyncStorage.getItem("@orbia:saldo");
      if (saldoSalvo !== null) {
        setSaldoAtual(parseFloat(saldoSalvo));
      }
    } catch (error) {
      console.error("Erro ao carregar saldo:", error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      recarregarItens();
      carregarSaldoInicial();
    }, [recarregarItens])
  );

  const superavite = useMemo(() => {
    let receita = 0;
    let despesa = 0;

    if (!Array.isArray(itens)) return 0;

    itens.forEach((item) => {
      const valor = Number(item.valor) || 0;
      if (item.natureza === "receita") receita += valor;
      else if (item.natureza === "despesa") despesa += valor;
    });

    return receita - despesa;
  }, [itens]);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Superavite itens={itens} />
      <Balance onSaldoChange={(novoSaldo) => setSaldoAtual(novoSaldo)} />
      <NextBalance saldoAtual={saldoAtual} superavite={superavite} />
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