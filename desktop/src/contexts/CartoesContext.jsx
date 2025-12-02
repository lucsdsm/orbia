import React, { createContext, useState, useContext, useEffect } from 'react';
import { supabase } from '../services/supabase';
import { useAuth } from './AuthContext';

const CartoesContext = createContext();

export const CartoesProvider = ({ children }) => {
  const [cartoes, setCartoes] = useState([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const carregarCartoes = async () => {
    if (!user) {
      setCartoes([]);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('cartoes')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true });

      if (error) throw error;

      const cartoesFormatados = data.map(cartao => ({
        id: cartao.id,
        nome: cartao.nome,
        limite: cartao.limite,
        cor: cartao.cor,
        color: cartao.cor,
        emoji: cartao.emoji,
        diaFechamento: cartao.dia_fechamento,
        dia_fechamento: cartao.dia_fechamento,
      }));

      setCartoes(cartoesFormatados);
    } catch (error) {
      console.error('Erro ao carregar cartões:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      carregarCartoes();
    } else {
      setCartoes([]);
      setLoading(false);
    }
  }, [user]);

  const addCartao = async (cartao) => {
    if (!user) return;

    const { data, error } = await supabase
      .from('cartoes')
      .insert([{
        nome: cartao.nome,
        limite: cartao.limite || null,
        cor: cartao.cor || null,
        emoji: cartao.emoji || null,
        dia_fechamento: cartao.diaFechamento || null,
        user_id: user.id,
      }])
      .select()
      .single();

    if (error) throw error;
    await carregarCartoes();
    return data;
  };

  const updateCartao = async (id, cartaoAtualizado) => {
    if (!user) return;

    const { error } = await supabase
      .from('cartoes')
      .update({
        nome: cartaoAtualizado.nome,
        limite: cartaoAtualizado.limite || null,
        cor: cartaoAtualizado.cor || null,
        emoji: cartaoAtualizado.emoji || null,
        dia_fechamento: cartaoAtualizado.diaFechamento || null,
      })
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) throw error;
    await carregarCartoes();
  };

  const deleteCartao = async (id) => {
    if (!user) return;

    const { error } = await supabase
      .from('cartoes')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id);

    if (error) throw error;
    await carregarCartoes();
  };

  const clearAllData = async () => {
    if (!user) return;

    const { error } = await supabase
      .from('cartoes')
      .delete()
      .eq('user_id', user.id);

    if (error) throw error;
    await carregarCartoes();
  };

  return (
    <CartoesContext.Provider value={{ cartoes, loading, addCartao, updateCartao, deleteCartao, clearAllData, reloadCartoes: carregarCartoes }}>
      {children}
    </CartoesContext.Provider>
  );
};

export const useCartoes = () => useContext(CartoesContext);

export { CartoesContext };
