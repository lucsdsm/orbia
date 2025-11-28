import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from './supabase';

export const ItensService = {
  // Adiciona um item
  async addItem(item, userId) {
    try {
      // Valida campos obrigatórios
      if (!item.nome || item.nome.trim() === '') {
        throw new Error('Nome do item é obrigatório');
      }
      if (item.valor === null || item.valor === undefined) {
        throw new Error('Valor do item é obrigatório');
      }
      if (!item.natureza || !item.tipo) {
        throw new Error('Natureza e tipo são obrigatórios');
      }

      let itemId = item.id;
      
      if (userId) {
        // Salva no Supabase (sem especificar ID, deixa o Supabase gerar UUID)
        const { data, error } = await supabase
          .from('itens')
          .insert([{
            nome: item.nome.trim(),
            valor: parseFloat(item.valor) || 0,
            natureza: item.natureza,
            tipo: item.tipo,
            categoria: item.categoria || null,
            cartao_id: item.cartaoId || null,
            parcelas: item.parcelas || null,
            mes_primeira_parcela: item.mesPrimeiraParcela || null,
            ano_primeira_parcela: item.anoPrimeiraParcela || null,
            user_id: userId,
          }])
          .select()
          .single();

        if (error) throw error;
        
        // Usa o ID gerado pelo Supabase
        itemId = data.id;
        item.id = data.id;
      }

      // Salva no cache local com o ID correto
      const itensExistentes = await AsyncStorage.getItem('itens');
      const itens = itensExistentes ? JSON.parse(itensExistentes) : [];
      itens.push({ ...item, id: itemId });
      await AsyncStorage.setItem('itens', JSON.stringify(itens));

      return { success: true };
    } catch (error) {
      console.error('Erro ao adicionar item:', error);
      throw error;
    }
  },

  // Atualiza um item
  async updateItem(id, itemAtualizado, userId) {
    try {
      // Valida campos obrigatórios
      if (!itemAtualizado.nome || itemAtualizado.nome.trim() === '') {
        throw new Error('Nome do item é obrigatório');
      }
      if (itemAtualizado.valor === null || itemAtualizado.valor === undefined) {
        throw new Error('Valor do item é obrigatório');
      }
      if (!itemAtualizado.natureza || !itemAtualizado.tipo) {
        throw new Error('Natureza e tipo são obrigatórios');
      }

      if (userId) {
        // Atualiza no Supabase
        const { error } = await supabase
          .from('itens')
          .update({
            nome: itemAtualizado.nome.trim(),
            valor: parseFloat(itemAtualizado.valor) || 0,
            natureza: itemAtualizado.natureza,
            tipo: itemAtualizado.tipo,
            categoria: itemAtualizado.categoria || null,
            cartao_id: itemAtualizado.cartaoId || null,
            parcelas: itemAtualizado.parcelas || null,
            mes_primeira_parcela: itemAtualizado.mesPrimeiraParcela || null,
            ano_primeira_parcela: itemAtualizado.anoPrimeiraParcela || null,
          })
          .eq('id', id)
          .eq('user_id', userId);

        if (error) throw error;
      }

      // Atualiza no cache local
      const itensExistentes = await AsyncStorage.getItem('itens');
      const itens = itensExistentes ? JSON.parse(itensExistentes) : [];
      const index = itens.findIndex(item => item.id === id);
      
      if (index !== -1) {
        itens[index] = { ...itens[index], ...itemAtualizado };
        await AsyncStorage.setItem('itens', JSON.stringify(itens));
      }

      return { success: true };
    } catch (error) {
      console.error('Erro ao atualizar item:', error);
      throw error;
    }
  },

  // Deleta um item
  async deleteItem(id, userId) {
    try {
      if (userId) {
        // Deleta do Supabase
        const { error } = await supabase
          .from('itens')
          .delete()
          .eq('id', id)
          .eq('user_id', userId);

        if (error) throw error;
      }

      // Deleta do cache local
      const itensExistentes = await AsyncStorage.getItem('itens');
      const itens = itensExistentes ? JSON.parse(itensExistentes) : [];
      const itensFiltrados = itens.filter(item => item.id !== id);
      await AsyncStorage.setItem('itens', JSON.stringify(itensFiltrados));

      return { success: true };
    } catch (error) {
      console.error('Erro ao deletar item:', error);
      throw error;
    }
  },

  // Sincroniza saldo com Supabase
  async syncSaldo(saldo, userId) {
    try {
      if (!userId) return;

      // Verifica se já existe registro de saldo
      const { data: saldoExistente, error: selectError } = await supabase
        .from('saldo')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (selectError && selectError.code !== 'PGRST116') {
        throw selectError;
      }

      if (saldoExistente) {
        // Atualiza saldo existente
        const { error } = await supabase
          .from('saldo')
          .update({ valor: saldo })
          .eq('user_id', userId);

        if (error) throw error;
      } else {
        // Cria novo registro de saldo
        const { error } = await supabase
          .from('saldo')
          .insert([{ user_id: userId, valor: saldo }]);

        if (error) throw error;
      }

      // Salva no cache local
      await AsyncStorage.setItem('@orbia:saldo', saldo.toString());

      return { success: true };
    } catch (error) {
      console.error('Erro ao sincronizar saldo:', error);
      throw error;
    }
  },

  // Carrega saldo do Supabase
  async loadSaldo(userId) {
    try {
      if (!userId) {
        // Carrega do cache local
        const saldoLocal = await AsyncStorage.getItem('@orbia:saldo');
        return saldoLocal ? parseFloat(saldoLocal) : 0;
      }

      // Carrega do Supabase
      const { data, error } = await supabase
        .from('saldo')
        .select('valor')
        .eq('user_id', userId)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      const saldo = data?.valor || 0;
      
      // Atualiza cache local
      await AsyncStorage.setItem('@orbia:saldo', saldo.toString());

      return saldo;
    } catch (error) {
      console.error('Erro ao carregar saldo:', error);
      // Fallback para cache local
      const saldoLocal = await AsyncStorage.getItem('@orbia:saldo');
      return saldoLocal ? parseFloat(saldoLocal) : 0;
    }
  },
};
