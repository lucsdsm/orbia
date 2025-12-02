import React, { createContext, useState, useContext, useEffect } from 'react';
import { supabase } from '../services/supabase';
import { useAuth } from './AuthContext';

const ItensContext = createContext();

export const ItensProvider = ({ children }) => {
  const [itens, setItens] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const carregarItens = async () => {
    if (!user) {
      setItens([]);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('itens')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const itensFormatados = data.map(item => ({
        id: item.id,
        nome: item.nome || item.descricao,
        descricao: item.descricao || item.nome,
        valor: parseFloat(item.valor) || 0,
        tipo: item.natureza || item.tipo,
        data: item.created_at || new Date().toISOString(),
        emoji: item.categoria || item.emoji || '💰',
        categoria: item.categoria || item.emoji,
        cartaoId: item.cartao_id,
        numParcelas: item.parcelas || 1,
        mesPrimeiraParcela: item.mes_primeira_parcela,
        mes_primeira_parcela: item.mes_primeira_parcela,
      }));

      setItens(itensFormatados);
    } catch (error) {
      console.error('Erro ao carregar itens:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      carregarItens();
    } else {
      setItens([]);
      setLoading(false);
    }
  }, [user]);

  const addItem = async (item) => {
    if (!user) return;

    const { data, error } = await supabase
      .from('itens')
      .insert([{
        nome: item.nome,
        descricao: item.descricao || item.nome,
        valor: parseFloat(item.valor),
        natureza: item.tipo,
        tipo: 'fixa',
        categoria: item.emoji || item.categoria,
        cartao_id: item.cartaoId || null,
        parcelas: item.numParcelas || null,
        mes_primeira_parcela: item.mesPrimeiraParcela || null,
        ano_primeira_parcela: item.anoPrimeiraParcela || null,
        user_id: user.id,
      }])
      .select()
      .single();

    if (error) throw error;
    await carregarItens();
    return data;
  };

  const updateItem = async (id, itemAtualizado) => {
    if (!user) return;

    const { error } = await supabase
      .from('itens')
      .update({
        nome: itemAtualizado.nome,
        descricao: itemAtualizado.descricao || itemAtualizado.nome,
        valor: parseFloat(itemAtualizado.valor),
        natureza: itemAtualizado.tipo,
        tipo: 'fixa',
        categoria: itemAtualizado.emoji || itemAtualizado.categoria,
        cartao_id: itemAtualizado.cartaoId || null,
        parcelas: itemAtualizado.numParcelas || null,
        mes_primeira_parcela: itemAtualizado.mesPrimeiraParcela || null,
        ano_primeira_parcela: itemAtualizado.anoPrimeiraParcela || null,
      })
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) throw error;
    await carregarItens();
  };

  const deleteItem = async (id) => {
    if (!user) return;

    const { error } = await supabase
      .from('itens')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) throw error;
    await carregarItens();
  };

  const clearAllData = async () => {
    if (!user) return;

    const { error } = await supabase
      .from('itens')
      .delete()
      .eq('user_id', user.id);

    if (error) throw error;
    await carregarItens();
  };

  return (
    <ItensContext.Provider value={{ itens, loading, addItem, updateItem, deleteItem, clearAllData, recarregarItens: carregarItens }}>
      {children}
    </ItensContext.Provider>
  );
};

export const useItens = () => useContext(ItensContext);

export { ItensContext };
