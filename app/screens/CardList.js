import React, { useMemo } from 'react';
import {View, Text, FlatList, TouchableOpacity, StyleSheet} from 'react-native';
import { Feather } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { useCartoes } from '../contexts/CartoesContext';
import { useItens } from '../contexts/ItensContext';

export default function CardList({ navigation }) {
  const { colors } = useTheme();
  const { cartoes } = useCartoes();
  const { itens } = useItens();

  // calcula o valor total de cada item no cartão
  const gastoPorCartao = useMemo(() => {
    const gastos = {};
    
    itens.forEach(item => {
      if (item.cartao && item.natureza === 'despesa') {
        let valorConsiderar = 0;
        
        if (item.tipo === 'parcelada' && item.parcelas) {
          const valorParcela = parseFloat(item.valor) || 0;
          const totalParcelas = parseInt(item.parcelas, 10) || 0;
          valorConsiderar = valorParcela * totalParcelas;
        } else {
          // para fixas ou outras, considera o valor único
          valorConsiderar = parseFloat(item.valor) || 0;
        }
        
        gastos[item.cartao] = (gastos[item.cartao] || 0) + valorConsiderar;
      }
    });
    return gastos;
  }, [itens]);

  const renderCard = ({ item }) => {
    const gastoTotal = gastoPorCartao[item.id] || 0;
    const percentualUtilizado = item.limite > 0 ? (gastoTotal / item.limite) * 100 : 0;
    const percentualLimitado = Math.min(percentualUtilizado, 100);

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
            
            {/* barra de progresso do limite */}
            <View style={[styles.colorIndicatorContainer, { backgroundColor: colors.secondBackground }]}>
              <View 
                style={[
                  styles.colorIndicator, 
                  { 
                    backgroundColor: item.color,
                    width: `${percentualLimitado}%`
                  }
                ]} 
              />
            </View>

            {item.limite > 0 && (
              <Text style={[styles.limite, { color: colors.textSecondary }]}>
                R$ {gastoTotal.toFixed(2)} / R$ {item.limite.toFixed(2)}
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
