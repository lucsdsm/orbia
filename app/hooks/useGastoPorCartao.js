import { useMemo } from 'react';
import { calcularGastoItem } from '../utils/calculations';

/**
 * Hook que calcula o gasto total por cartão (apenas parcelas restantes).
 */
export const useGastoPorCartao = (itens) => {
  return useMemo(() => {
    const gastos = {};
    
    itens.forEach(item => {
      if (item.cartao && item.natureza === 'despesa') {
        const valorConsiderar = calcularGastoItem(item);
        gastos[item.cartao] = (gastos[item.cartao] || 0) + valorConsiderar;
      }
    });
    
    return gastos;
  }, [itens]);
};
