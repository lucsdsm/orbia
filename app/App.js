import React, { useState, useEffect, useCallback } from "react";
import { View, StyleSheet } from "react-native";

import { NavigationContainer } from "@react-navigation/native";
import { createStackNavigator, CardStyleInterpolators } from "@react-navigation/stack";

import { ThemeProvider, useTheme } from "./ThemeContext";

import Toast from "react-native-toast-message";
import AsyncStorage from '@react-native-async-storage/async-storage';

import Header from "./components/Header";
import Saldo from "./components/Saldo";
import Superavite from "./components/Superavite";
import Footer from "./components/Footer";

import ItemAdd from "./screens/ItemAdd";
import ItemList from "./screens/ItemList";

const Stack = createStackNavigator();

function HomeScreen({ navigation }) {
  const { colors } = useTheme();
  const [itens, setItens] = useState([]);

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

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Header />
      <Superavite itens={itens} /> 
      <Saldo itens={itens} /> 
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