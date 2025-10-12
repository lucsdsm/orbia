import React from "react";
import { View, StyleSheet } from "react-native";
import { createMaterialTopTabNavigator } from "@react-navigation/material-top-tabs";
import { useTheme } from "../ThemeContext";
import { useNavigation } from "@react-navigation/native";

import Home from "../screens/Home";
import ItemList from "../screens/ItemList";
import Header from "./Header";
import Footer from "./Footer";

const Tab = createMaterialTopTabNavigator();

export default function Navigator() {
  const { colors } = useTheme();
  const navigation = useNavigation();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header fixo */}
      <Header />

      {/* Conteúdo com swipe horizontal */}
      <View style={styles.content}>
        <Tab.Navigator
          screenOptions={{
            headerShown: false,               
            tabBarStyle: { height: 0 },       
            swipeEnabled: true,               
          }}
        >
          <Tab.Screen name="Início" component={Home} />
          <Tab.Screen name="Itens" component={ItemList} />
        </Tab.Navigator>
      </View>

      {/* Footer fixo */}
      <Footer
        onNovoItem={(tipo) => {
          navigation.navigate("ItemAdd", {
            natureza: tipo,
            onAdd: null, // O Home recarrega automaticamente ao voltar ao foco
          });
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
  },
});
