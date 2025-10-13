import React from 'react';
import { View, Text, StyleSheet, StatusBar, Platform } from 'react-native';
import { useTheme } from '../ThemeContext';

import Indicator from './Indicator';

export default function Header({ scrollX, totalPages }) {
  const { colors, isDark } = useTheme();

  return (
    <View style={[styles.wrapper, { backgroundColor: colors.background }]}>
      <StatusBar 
        backgroundColor={colors.background} 
        barStyle={isDark ? "light-content" : "dark-content"} 
      />
      <View style={[styles.container, { backgroundColor: colors.background }]}>
        <Text style={[styles.title, { color: colors.text }]}>Orbia</Text>
        <Text style={[styles.version, { color: colors.text, opacity: 0.6 }]}>versão 0.1</Text>

        {scrollX && totalPages && (
          <Indicator scrollX={scrollX} totalPages={totalPages} />
        )}
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
    fontStyle: "italic",
    marginTop: 2,
  },
});