import React from 'react';
import {View, Text, FlatList, TouchableOpacity, StyleSheet} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { useCartoes } from '../contexts/CartoesContext';
import { useItens } from '../contexts/ItensContext';
import { useGastoPorCartao } from '../hooks';
import { calcularPercentualLimite } from '../utils/calculations';
import { formatCurrency } from '../utils/formatters';

export default function CardList({ navigation }) {
  const { colors } = useTheme();
  const { cartoes } = useCartoes();
  const { itens } = useItens();
  
  const gastoPorCartao = useGastoPorCartao(itens);

  const renderCard = ({ item }) => {
    const gastoTotal = gastoPorCartao[item.id] || 0;
    const percentualUtilizado = calcularPercentualLimite(gastoTotal, item.limite);

    return (
      <TouchableOpacity
        activeOpacity={0.8}
        style={[styles.card, { backgroundColor: colors.card }]}
        onPress={() => navigation.navigate('CardEdit', { card: item })}
      >
        <View style={styles.cardLeft}>
          <Text style={styles.emoji}>{item.emoji || '💳'}</Text>
          <View style={styles.cardInfo}>
            <Text style={[styles.nome, { color: colors.text }]}>{item.nome}</Text>
            
            <View style={[styles.colorIndicatorContainer, { backgroundColor: colors.secondBackground }]}>
              <View 
                style={[
                  styles.colorIndicator, 
                  { 
                    backgroundColor: item.cor || item.color,
                    width: `${percentualUtilizado}%`
                  }
                ]} 
              />
            </View>

            {item.limite > 0 && (
              <Text style={[styles.limite, { color: colors.textSecondary }]}>
                R$ {formatCurrency(gastoTotal)} / R$ {formatCurrency(item.limite)}
              </Text>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <FlatList
        data={cartoes.sort((a, b) => a.nome.localeCompare(b.nome))}
        keyExtractor={(item) => item.id}
        renderItem={renderCard}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <Text style={[styles.emptyText, { color: colors.textSecondary }]}>
            Nenhum cartão cadastrado, por enquanto 😲.
          </Text>
        }
      />

      <TouchableOpacity
            style={[styles.fab, { backgroundColor: colors.text }]}
            onPress={() => navigation.navigate('CardAdd')} >
            <Feather name="plus" size={24} color={colors.background} />
        </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  list: {
    marginTop: 72,
    padding: 16,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    marginHorizontal: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  emoji: {
    fontSize: 32,
    marginRight: 12,
  },
  cardInfo: {
    flex: 1,
  },
  nome: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 6,
  },
  colorIndicatorContainer: {
    height: 6,
    borderRadius: 3,
    overflow: 'hidden',
  },
  colorIndicator: {
    height: '100%',
    borderRadius: 3,
  },
  limite: {
    fontSize: 12,
    marginTop: 4,
  },
  iconButton: {
    padding: 8,
    marginLeft: 8,
  },
  fab: {
    position: 'absolute',
    right: 36,
    width: 48,
    height: 48,
    top: 24,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 32,
    fontSize: 16,
  },
});
