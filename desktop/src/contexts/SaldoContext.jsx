import React, { createContext, useState, useContext, useEffect } from 'react';
import { supabase } from '../services/supabase';
import { useAuth } from './AuthContext';

const SaldoContext = createContext();

export const SaldoProvider = ({ children }) => {
  const [saldo, setSaldo] = useState(0);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const carregarSaldo = async () => {
    if (!user) {
      setSaldo(0);
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('saldo')
        .select('valor')
        .eq('user_id', user.id)
        .single();

      if (error) {
        // Se não existir saldo, cria um novo com valor 0
        if (error.code === 'PGRST116') {
          const { error: insertError } = await supabase
            .from('saldo')
            .insert([{
              user_id: user.id,
              valor: 0,
            }]);

          if (insertError) throw insertError;
          setSaldo(0);
        } else {
          throw error;
        }
      } else {
        setSaldo(data.valor);
      }
    } catch (error) {
      console.error('Erro ao carregar saldo:', error);
      setSaldo(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      carregarSaldo();
    } else {
      setSaldo(0);
      setLoading(false);
    }
  }, [user]);

  const atualizarSaldo = async (novoSaldo) => {
    if (!user) return;

    try {
      const valor = parseFloat(novoSaldo);
      if (isNaN(valor)) {
        throw new Error('Valor inválido');
      }

      const { error } = await supabase
        .from('saldo')
        .upsert({
          user_id: user.id,
          valor: valor,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'user_id'
        });

      if (error) throw error;

      setSaldo(valor);
      return { success: true };
    } catch (error) {
      console.error('Erro ao atualizar saldo:', error);
      return { success: false, error };
    }
  };

  return (
    <SaldoContext.Provider value={{ saldo, loading, atualizarSaldo, carregarSaldo }}>
      {children}
    </SaldoContext.Provider>
  );
};

export const useSaldo = () => useContext(SaldoContext);

export { SaldoContext };
