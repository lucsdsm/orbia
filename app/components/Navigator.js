import React from "react";
import { View, StyleSheet } from "react-native";
import { createStackNavigator, TransitionPresets } from "@react-navigation/stack";
import { useTheme } from "../contexts/ThemeContext";
import { useNavigation } from "@react-navigation/native";

import Settings from "../screens/Settings";
import Home from "../screens/Home";
import ItemList from "../screens/ItemList";
import ItemByMonth from "../screens/ItemByMonth";
import ItemByCard from "../screens/ItemByCard";
import CardList from "../screens/CardList";
import Charts from "../screens/Charts";
import Header from "./Header";
import Footer from "./Footer";

const Stack = createStackNavigator();

/**
 * Navegador principal do aplicativo com Drawer e pilhas de navegação.
*/
export default function Navigator() {
  const { colors } = useTheme();
  const navigation = useNavigation();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>

      <Header/>

      <View style={styles.content}>
        <Stack.Navigator
          initialRouteName="Início"
          screenOptions={{
            headerShown: false,
            animationEnabled: false,
          }}
        >
          <Stack.Screen name="Início" component={Home} />
          <Stack.Screen name="Itens" component={ItemList} />
          <Stack.Screen name="Por Mês" component={ItemByMonth} />
          <Stack.Screen name="Por Cartão" component={ItemByCard} />
          <Stack.Screen name="Cartões" component={CardList} />
          <Stack.Screen name="Gráficos" component={Charts} />
          <Stack.Screen name="Configurações" component={Settings} />
        </Stack.Navigator>
      </View>


      <View style={styles.footerContainer}>
        <Footer
          onNovoItem={(tipo) => {
            navigation.navigate("ItemAdd", {
              natureza: tipo,
            });
          }}
        />
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
    marginBottom: 115, 
  },
  footerContainer: {
    position: 'absolute',
    bottom: 10,
    left: 0,
    right: 0,
  },
});