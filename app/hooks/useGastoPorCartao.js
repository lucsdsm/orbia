import { useMemo } from 'react';
import { calcularGastoItem } from '../utils/calculations';

/**
 * Hook que calcula o gasto total por cartão (apenas parcelas restantes).
 */
export const useGastoPorCartao = (itens) => {
  return useMemo(() => {
    const gastos = {};
    
    itens.forEach(item => {
      const cartaoId = item.cartaoId || item.cartao;
      if (cartaoId && item.natureza === 'despesa') {
        const valorConsiderar = calcularGastoItem(item);
        gastos[cartaoId] = (gastos[cartaoId] || 0) + valorConsiderar;
      }
    });
    
    return gastos;
  }, [itens]);
};
