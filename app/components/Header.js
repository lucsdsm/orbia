import React from 'react';
import { View, Text, StyleSheet, StatusBar, Platform } from 'react-native';
import { useTheme } from '../contexts/ThemeContext';

/**
 * Header do aplicativo exibindo título e versão.
*/
export default function Header() {
  const { colors, isDark } = useTheme();

  return (
    <View style={[styles.wrapper, { backgroundColor: colors.background }]}>
      <StatusBar 
        backgroundColor={colors.background} 
        barStyle={isDark ? "light-content" : "dark-content"} 
      />
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={[styles.title, { color: colors.text }]}>Orbia</Text>
        <Text style={[styles.version, { color: colors.text, opacity: 0.6 }]}>versão 1.0.2</Text>
      </View>  
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: "center",
    paddingTop: StatusBar.currentHeight, 
    marginTop: Platform.OS === 'ios' ? 20 : 5,
  },
  container: {
    width: 150,        
    height: 50,     
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
  },
  version: {
    fontSize: 10,
    marginTop: 2,
  },
});