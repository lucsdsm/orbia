import React, { useEffect, useState } from "react";
import { View, Text, FlatList, StyleSheet, TouchableOpacity, TextComponent  } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { useTheme } from "../ThemeContext";

export default function Itens() {
  const { colors, isDark } = useTheme();
  const [itens, setItens] = useState([]);

  // Carrega os itens do AsyncStorage ao montar o componente
  useEffect(() => {
    const carregarItens = async () => {
      try {
        const itensExistentes = await AsyncStorage.getItem("itens");
        setItens(itensExistentes ? JSON.parse(itensExistentes) : []);
      } catch (error) {
        console.log("Erro ao carregar itens:", error);
      }
    };

    carregarItens();
  }, []);

  // Função para remover item
  const removerItem = async (index) => {
    try {
      const novosItens = [...itens];
      novosItens.splice(index, 1); // remove o item do array
      await AsyncStorage.setItem("itens", JSON.stringify(novosItens)); // salva no AsyncStorage
      setItens(novosItens); // atualiza state
    } catch (error) {
      console.log("Erro ao remover item:", error);
    }
  };

  // Renderiza cada item da lista
  const renderItem = ({ item, index }) => (
    <View style={[styles.item, { backgroundColor: colors.text }]}>
      <View>
        <Text style={[styles.descricao, { color: colors.background }]}>{item.descricao}</Text>
        <Text style={[styles.valor, { color: colors.background }]}>
          {item.tipo === "receita" ? "+" : "-"} R$ {item.valor}
        </Text>
      </View>
      
      {/* Botão de lixeira */}
      <TouchableOpacity onPress={() => removerItem(index)} style={{ alignContent: "center", justifyContent: "center" }}>
        <Text style={{ fontSize: 24 }}>
          🗑️
        </Text>
      </TouchableOpacity>
    </View>
    
  );

  return (
    <View style={styles.container}>
      {itens.length === 0 ? (
        <Text style={styles.vazio}>Nenhum item cadastrado</Text>
      ) : (
        <FlatList
          data={itens}
          keyExtractor={(item, index) => index.toString()}
          renderItem={renderItem}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "90%",
    marginVertical: 20,
  },
  item: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  descricao: {
    fontWeight: "bold",
  },
  valor: {
    fontWeight: "bold",
  },
  vazio: {
    textAlign: "center",
    color: "#999",
  },
});
