import React from 'react';
import { View, Text, StyleSheet, StatusBar, Platform } from 'react-native';
import { useTheme } from '../ThemeContext';

export default function Header() {
  const { colors, isDark } = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StatusBar 
        backgroundColor={colors.background} 
        barStyle={isDark ? "light-content" : "dark-content"} 
      />
      {/* <View style={[styles.semiCircle, { backgroundColor: colors.text }]}>
        <Text style={[styles.title, { color: colors.background }]}>Orbia</Text>
      </View> */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: "center",
    paddingTop: StatusBar.currentHeight + 20, 
    marginTop: Platform.OS === 'ios' ? 40 : 0,
  },
  semiCircle: {
    width: 150,        
    height: 50,     
    borderBottomLeftRadius: 100,  
    borderBottomRightRadius: 100, 
    borderTopLeftRadius: 100,
    borderTopRightRadius: 100,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 22,
    fontWeight: "bold",
  },
});