import React from 'react';
import { View, TouchableOpacity, StyleSheet } from 'react-native';

/**
 * Grid de seleção de cores.
*/
export default function ColorGrid({ colors, selectedColor, onColorSelect }) {
  return (
    <View style={styles.colorGrid}>
      {colors.map((color) => (
        <TouchableOpacity
          key={color}
          style={[
            styles.colorButton,
            { backgroundColor: color },
            selectedColor === color && styles.colorSelected,
          ]}
          onPress={() => onColorSelect(color)}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 5,
    alignContent: 'center',
    justifyContent: 'center',
  },
  colorButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  colorSelected: {
    borderWidth: 3,
    borderColor: '#FFF',
  },
});
