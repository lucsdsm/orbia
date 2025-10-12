import React from 'react';
import { View, Text, StyleSheet, StatusBar, Platform } from 'react-native';
import { useTheme } from '../ThemeContext';

export default function Header() {
  const { colors, isDark } = useTheme();

  return (
    <View style={[styles.wrapper, { backgroundColor: colors.background }]}>
      <StatusBar 
        backgroundColor={colors.background} 
        barStyle={isDark ? "light-content" : "dark-content"} 
      />
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={[styles.title, { color: colors.text }]}> versão 0.1 </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    alignItems: "center",
    paddingTop: StatusBar.currentHeight, 
    marginTop: Platform.OS === 'ios' ? 20 : 0,
  },
  container: {
    width: 150,        
    height: 50,     
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 12,
    fontStyle: "italic",
  },
});