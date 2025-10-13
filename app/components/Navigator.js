import React, { useState, useRef } from "react";
import { View, StyleSheet, Animated } from "react-native";
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
  
  const scrollX = useRef(new Animated.Value(0)).current;
  const totalPages = 2; 

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>

      <Header scrollX={scrollX} totalPages={totalPages} />

      <View style={styles.content}>
        <Tab.Navigator
          screenOptions={{
            headerShown: false,               
            tabBarStyle: { height: 0 },       
            swipeEnabled: true,               
          }}

          screenListeners={{
            state: (e) => {
              const index = e.data.state.index;
              Animated.spring(scrollX, {
                toValue: index * 150, 
                useNativeDriver: true,
                friction: 8,
              }).start();
            },
          }}
        >
          <Tab.Screen name="Início" component={Home} />
          <Tab.Screen name="Itens" component={ItemList} />
        </Tab.Navigator>
      </View>


      <Footer
        onNovoItem={(tipo) => {
          navigation.navigate("ItemAdd", {
            natureza: tipo,
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