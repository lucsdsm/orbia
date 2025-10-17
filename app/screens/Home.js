import React, { useState, useEffect, useCallback, useMemo } from "react";
import { View, StyleSheet } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useTheme } from "../ThemeContext";
import { useItens } from "../ItensContext";
import { useFocusEffect } from "@react-navigation/native";

import Superavite from "../components/Superavite";
import Balance from "../components/Balance";
import NextBalance from "../components/NextBalance";

function useSaldo() {
  const [saldo, setSaldo] = React.useState(0);

  const carregarSaldo = useCallback(async () => {
    try {
      const saldoSalvo = await AsyncStorage.getItem("@orbia:saldo");
      if (saldoSalvo !== null) {
        setSaldo(parseFloat(saldoSalvo));
      }
    } catch (error) {
      console.error("Erro ao carregar saldo:", error);
    }
  }, []);

  useEffect(() => {
    carregarSaldo();
  }, [carregarSaldo]);

  useFocusEffect(
    useCallback(() => {
      carregarSaldo();
    }, [carregarSaldo])
  );

  return saldo;
}

export default function Home({ navigation }) {
  const { colors } = useTheme();
  const { itens, recarregarItens } = useItens();
  const saldoAtual = useSaldo();

  useFocusEffect(
    useCallback(() => {
      recarregarItens();
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
      <Balance />
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