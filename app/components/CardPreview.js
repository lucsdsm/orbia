import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { formatCurrency } from '../utils/formatters';

/**
 * Preview visual do cartão sendo criado/editado.
*/
export default function CardPreview({ nome, emoji, color, limite, colors }) {
  return (
    <View style={[styles.preview, { backgroundColor: colors.card }]}>
      <Text style={styles.previewEmoji}>{emoji || '💳'}</Text>
      <Text style={[styles.previewNome, { color: colors.text }]}>
        {nome || 'Nome do Cartão'}
      </Text>
      
      <View style={[styles.previewColor, { backgroundColor: color }]} />
      {limite && (
        <Text style={[styles.previewLimite, { color: colors.textSecondary }]}>
          Limite: R$ {formatCurrency(limite)}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  preview: {
    padding: 10,
    borderRadius: 12,
    marginBottom: 10,
    marginLeft: 20,
    marginRight: 20,
    alignItems: 'center',
  },
  previewEmoji: {
    fontSize: 48,
    marginBottom: 8,
  },
  previewNome: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 12,
  },
  previewColor: {
    width: 100,
    height: 8,
    borderRadius: 4,
  },
  previewLimite: {
    fontSize: 14,
    marginTop: 8,
  },
});
