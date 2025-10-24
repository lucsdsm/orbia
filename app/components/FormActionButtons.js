import React from 'react';
import { View, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { Feather } from '@expo/vector-icons';

/**
 * Botões de ação do formulário (Salvar, Excluir, Cancelar)
*/
export default function FormActionButtons({ 
  onSave, 
  onDelete, 
  onCancel, 
  saveLabel = 'Salvar',
  showDelete = false 
}) {
  return (
    <View style={styles.buttonRow}>
      <TouchableOpacity
        style={[styles.iconButton, { backgroundColor: "#4CAF50" }]}
        onPress={onSave}
      >
        <Feather name="check" size={24} color="#FFF" />
        <Text style={styles.iconButtonText}>{saveLabel}</Text>
      </TouchableOpacity>

      {showDelete && (
        <TouchableOpacity
          style={[styles.iconButton, { backgroundColor: "#F44336" }]}
          onPress={onDelete}
        >
          <Feather name="trash-2" size={24} color="#FFF" />
          <Text style={styles.iconButtonText}>Excluir</Text>
        </TouchableOpacity>
      )}

      <TouchableOpacity
        style={[styles.iconButton, { backgroundColor: "#757575" }]}
        onPress={onCancel}
      >
        <Feather name="x" size={24} color="#FFF" />
        <Text style={styles.iconButtonText}>Cancelar</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
    marginTop: 20,
    marginHorizontal: 10,
  },
  iconButton: {
    flex: 1,
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 10,
    gap: 6,
  },
  iconButtonText: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '600',
  },
});
