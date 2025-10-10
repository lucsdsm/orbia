import React, { useState, useEffect, useCallback, useMemo } from "react";
import { View, StyleSheet } from "react-native";

import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator, CardStyleInterpolators } from "@react-navigation/stack";

import { ThemeProvider, useTheme } from "./ThemeContext";

import Toast from "react-native-toast-message";
import AsyncStorage from '@react-native-async-storage/async-storage';

import Header from "./components/Header";

import Superavite from "./components/Superavite";
import Balance from "./components/Balance";
import NextBalance from "./components/NextBalance";

import Footer from "./components/Footer";

import ItemAdd from "./screens/ItemAdd";
import ItemList from "./screens/ItemList";
import ItemEdit from "./screens/ItemEdit";

const Stack = createStackNavigator();

function HomeScreen({ navigation }) {
  const { colors } = useTheme();
  const [itens, setItens] = useState([]);
  const [diferenca, setDiferenca] = useState(0);

  const carregarItens = useCallback(async () => {
    try {
      const itensExistentes = await AsyncStorage.getItem("itens");
      if (itensExistentes) {
        setItens(JSON.parse(itensExistentes));
      }
    } catch (error) {
      console.error("Erro ao carregar itens:", error);
    }
  }, []);

  useEffect(() => {
    carregarItens();
  }, [carregarItens]);

  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      carregarItens();
    });

    return unsubscribe;
  }, [navigation, carregarItens]);

  const superavite = useMemo(() => {
    let receita = 0;
    let despesa = 0;

    if (!Array.isArray(itens)) return 0;

    itens.forEach(item => {
      const valor = Number(item.valor) || 0;
      if (item.natureza === "Receita") receita += valor;
      else if (item.natureza === "Despesa") despesa += valor;
    });

    return receita - despesa;
  }, [itens]);

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Header />
      <Superavite itens={itens} /> 
      <Balance itens={itens} diferenca={diferenca} setDiferenca={setDiferenca} />
      <NextBalance 
        saldoAtual={diferenca} 
        superavite={superavite} 
      /> 
      <Footer 
        onNovoItem={(tipo) => {
          navigation.navigate('ItemAdd', { 
            natureza: tipo,
            onAdd: (novoItem) => {
              setItens(prev => [...prev, novoItem]);
            }
          });
        }}
      />
    </View>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <NavigationContainer>
        <Stack.Navigator
          screenOptions={{
            headerShown: false,
            gestureEnabled: true,
            cardStyleInterpolator: CardStyleInterpolators.forVerticalIOS,
          }}>
          <Stack.Screen name="Home" component={HomeScreen} />
          <Stack.Screen 
            name="ItemAdd" 
            component={ItemAdd}
          />
          <Stack.Screen 
            name="ItemList" 
            component={ItemList}
          />
          <Stack.Screen
            name="ItemEdit"
            component={ItemEdit}
            options={{
              presentation: "modal",
              animation: "slide_from_bottom",
            }}
          />
        </Stack.Navigator>
        <Toast />
      </NavigationContainer>
    </ThemeProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "space-between",
  },
});