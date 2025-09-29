import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function Header() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}> Orbia </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#6200EE', // cor roxa minimalista
    paddingTop: 50, // para o notch do celular
    paddingBottom: 15,
    alignItems: 'center', // centraliza horizontalmente
  },
  title: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: 'bold',
  },
});