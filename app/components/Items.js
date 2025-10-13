import React, { useEffect, useState } from "react";
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

import { useTheme } from "../ThemeContext";

import { useNavigation, useFocusEffect } from "@react-navigation/native";

import Toast from "react-native-toast-message";

import { MaterialIcons } from "@expo/vector-icons";

export default function Itens() {
  const { colors, isDark } = useTheme();
  const [itens, setItens] = useState([]);
  const navigation = useNavigation();

  const carregarItens = async () => {
    try {
      const itensExistentes = await AsyncStorage.getItem("itens");
      const itensCarregados = itensExistentes ? JSON.parse(itensExistentes) : [];
      setItens(itensCarregados);
    } catch (error) {
      console.log("Erro ao carregar itens:", error);
    }
  };

  // recarrega sempre que a tela receber foco
  useFocusEffect(
    React.useCallback(() => {
      carregarItens();
    }, [])
  );

  // função para remover item
  const removerItem = async (index) => {
    try {
      const novosItens = [...itens];
      novosItens.splice(index, 1);
      await AsyncStorage.setItem("itens", JSON.stringify(novosItens));
      setItens(novosItens);
      
      Toast.show({
        type: "success",
        text1: "Item removido!",
        position: "top",
        visibilityTime: 2000,
      });
    } catch (error) {
      console.log("Erro ao remover item:", error);
    }
  };

  // renderiza cada item da lista
  const renderItem = ({ item, index }) => (
    <View style={[styles.item, { backgroundColor: colors.text, borderLeftColor: item.natureza === "Receita" ? "#4CAF50" : "#F44336" }]}>
      <View>
        <Text style={[styles.descricao, { color: colors.background }]}>{item.descricao}</Text>
        <Text style={[styles.valor, { color: colors.background }]}>
          {item.natureza === "Receita" ? "+" : "-"} R$ {item.valor.toFixed(2)}
        </Text>
      </View>

      {/* botões */}
      <View style={{ flexDirection: "row", alignItems: "center", gap: 15 }}>
        {/* botão de editar */}
        <TouchableOpacity
          onPress={() => navigation.navigate("ItemEdit", {
            item,
            onEdit: async (itemEditado) => {
              try {
                const itensAtualizados = itens.map(i => i.id === itemEditado.id ? itemEditado : i);
                await AsyncStorage.setItem("itens", JSON.stringify(itensAtualizados));
                setItens(itensAtualizados);
              } catch (error) {
                console.log("Erro ao atualizar item:", error);
              }
            }
          })}
          style={{ marginRight: 10 }}
        >
          <MaterialIcons name="edit" size={28} color={colors.background} />
        </TouchableOpacity>
        
        {/* botão de lixeira */}
        <TouchableOpacity
          onPress={() => {
            Toast.show({
              type: "error",
              text1: "Excluir item?",
              text2: "Toque novamente para confirmar.",
              position: "top",
              visibilityTime: 2500,
              onPress: () => {
                removerItem(index);
                Toast.hide();
              },
            });
          }}
          style={{ alignItems: "center", justifyContent: "center" }}
        >
          <MaterialIcons name="delete" size={28} color={colors.background} />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      {itens.length === 0 ? (
        <Text style={[styles.vazio, { color: colors.text }]}>Nenhum item cadastrado, ainda 😄.</Text>
      ) : (
        <FlatList
          data={itens}
          keyExtractor={(item) => item.id} 
          renderItem={renderItem}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: "100%",
    padding: 20,
  },
  item: {
    flexDirection: "row",
    justifyContent: "space-between",
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    borderLeftWidth: 5,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    elevation: 2,
  },
  descricao: {
    fontWeight: "bold",
  },
  valor: {
    fontWeight: "bold",
  },
  vazio: {
    textAlign: "center",
    marginTop: 50,
    fontSize: 16,
  },
});