import React, { createContext, useState, useContext, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { supabase } from "../services/supabase";
import NetInfo from "@react-native-community/netinfo";
import { saldoEmitter, SALDO_EVENTS } from "../events/saldoEvents";

const SaldoContext = createContext();

export function SaldoProvider({ children }) {
  const [saldo, setSaldo] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(true);
  const [userId, setUserId] = useState(null);

  // Monitora conexão de internet
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsOnline(state.isConnected);
    });

    return () => unsubscribe();
  }, []);

  // Monitora autenticação
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setUserId(session?.user?.id || null);
      } catch (error) {
        console.log('Erro ao verificar sessão (SaldoContext):', error.message);
        setUserId(null);
      }
    };

    checkAuth();

    let subscription;
    try {
      const { data } = supabase.auth.onAuthStateChange((_event, session) => {
        const newUserId = session?.user?.id || null;
        setUserId(newUserId);
        
        // Se o usuário fez login, carrega saldo
        if (newUserId && !userId) {
          carregarSaldo(newUserId);
        }
      });
      subscription = data.subscription;
    } catch (error) {
      console.log('Erro ao configurar listener de auth (SaldoContext):', error.message);
    }

    return () => {
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }, []);

  // Sincroniza saldo com Supabase
  const sincronizarComNuvem = async (userId) => {
    if (!isOnline || !userId) return;

    try {
      const { data, error } = await supabase
        .from('saldo')
        .select('valor')
        .eq('user_id', userId)
        .single();

      if (error) {
        // Se não existir saldo, cria um novo
        if (error.code === 'PGRST116') {
          const saldoLocal = await AsyncStorage.getItem("@orbia:saldo");
          const valorInicial = saldoLocal ? parseFloat(saldoLocal) : 0;
          
          await supabase
            .from('saldo')
            .insert([{
              user_id: userId,
              valor: valorInicial,
            }]);
          
          setSaldo(valorInicial);
        } else {
          throw error;
        }
      } else {
        setSaldo(data.valor);
        await AsyncStorage.setItem("@orbia:saldo", data.valor.toString());
      }
    } catch (error) {
      console.error('Erro ao sincronizar saldo:', error);
      // Se falhar, carrega do cache local
      await carregarDoCacheLocal();
    }
  };

  // Carrega do cache local
  const carregarDoCacheLocal = async () => {
    try {
      const saldoSalvo = await AsyncStorage.getItem("@orbia:saldo");
      if (saldoSalvo !== null) {
        setSaldo(parseFloat(saldoSalvo));
      }
    } catch (error) {
      console.error("Erro ao carregar saldo local:", error);
    }
  };

  const carregarSaldo = async (currentUserId = null) => {
    const userIdToUse = currentUserId || userId;
    
    try {
      if (userIdToUse && isOnline) {
        await sincronizarComNuvem(userIdToUse);
      } else {
        await carregarDoCacheLocal();
      }
    } catch (error) {
      console.error("Erro ao carregar saldo:", error);
      await carregarDoCacheLocal();
    } finally {
      setLoading(false);
    }
  };

  // Carrega inicialmente
  useEffect(() => {
    if (loading) {
      carregarSaldo();
    }
  }, []);

  // Sincroniza quando userId ou isOnline mudam
  useEffect(() => {
    if (userId && !loading) {
      carregarSaldo(userId);
    }
  }, [userId, isOnline]);

  // Atualizar saldo (salva no Supabase se estiver online e autenticado)
  const atualizarSaldo = async (novoSaldo) => {
    try {
      const valor = parseFloat(novoSaldo);
      if (isNaN(valor)) {
        throw new Error('Valor inválido');
      }

      // Atualiza estado local
      setSaldo(valor);

      // Salva no AsyncStorage
      await AsyncStorage.setItem("@orbia:saldo", valor.toString());

      // Se estiver online e autenticado, atualiza no Supabase
      if (userId && isOnline) {
        const { error } = await supabase
          .from('saldo')
          .upsert({
            user_id: userId,
            valor: valor,
            updated_at: new Date().toISOString(),
          }, {
            onConflict: 'user_id'
          });

        if (error) throw error;
      }

      // Emite evento de mudança de saldo
      saldoEmitter.emit(SALDO_EVENTS.SALDO_CHANGED, valor);

      return { success: true };
    } catch (error) {
      console.error('Erro ao atualizar saldo:', error);
      return { success: false, error };
    }
  };

  return (
    <SaldoContext.Provider value={{ 
      saldo, 
      loading, 
      atualizarSaldo, 
      carregarSaldo,
      isOnline, 
      userId 
    }}>
      {children}
    </SaldoContext.Provider>
  );
}

export function useSaldo() {
  const context = useContext(SaldoContext);
  if (!context) {
    throw new Error("useSaldo deve ser usado dentro de um SaldoProvider");
  }
  return context;
}
