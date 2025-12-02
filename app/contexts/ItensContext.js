import React, { createContext, useState, useContext, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { StorageService } from "../services/storage";
import { supabase } from "../services/supabase";
import NetInfo from "@react-native-community/netinfo";

const ItensContext = createContext();

export function ItensProvider({ children }) {
  const [itens, setItens] = useState([]);
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
        console.log('Erro ao verificar sessão (ItensContext):', error.message);
        setUserId(null);
      }
    };

    checkAuth();

    let subscription;
    try {
      const { data } = supabase.auth.onAuthStateChange((_event, session) => {
        const newUserId = session?.user?.id || null;
        setUserId(newUserId);
        
        // Se o usuário fez login, sincroniza dados
        if (newUserId && !userId) {
          carregarItens(newUserId);
        }
      });
      subscription = data.subscription;
    } catch (error) {
      console.log('Erro ao configurar listener de auth (ItensContext):', error.message);
    }

    return () => {
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }, []);

  // Migra dados locais para Supabase quando usuário faz login
  const migrarDadosLocaisParaNuvem = async (userId) => {
    try {
      // Verifica se acabamos de limpar os dados (flag de controle)
      const dadosLimpos = await AsyncStorage.getItem("@orbia:dados_limpos");
      if (dadosLimpos === "true") {
        console.log('Migração cancelada: dados foram limpos recentemente');
        await AsyncStorage.removeItem("@orbia:dados_limpos");
        return;
      }
      
      const itensLocais = await AsyncStorage.getItem("itens");
      if (!itensLocais) return;

      const itens = JSON.parse(itensLocais);
      if (itens.length === 0) return;

      // Verifica se já existem dados na nuvem
      const { data: itensNuvem, error } = await supabase
        .from('itens')
        .select('id')
        .eq('user_id', userId)
        .limit(1);

      if (error) throw error;

      // Se já tem dados na nuvem, não migra
      if (itensNuvem && itensNuvem.length > 0) return;

      // Filtra e valida itens antes de migrar
      const itensValidos = itens.filter(item => {
        // Aceita tanto 'nome' quanto 'descricao' (formato antigo)
        const nome = item.nome || item.descricao;
        if (!nome || nome.trim() === '') return false;
        if (item.valor === null || item.valor === undefined) return false;
        if (!item.natureza || !item.tipo) return false;
        return true;
      });

      if (itensValidos.length === 0) {
        console.log('Nenhum item válido para migrar');
        return;
      }

      // Migra dados locais para nuvem (sem especificar ID, deixa o Supabase gerar)
      const itensParaMigrar = itensValidos.map(item => {
        // Mapeia campos antigos para novos
        const nome = item.nome || item.descricao;
        const cartaoId = item.cartaoId || item.cartao || null;
        
        // Valida se cartaoId é um UUID válido, caso contrário define como null
        const cartaoIdValido = cartaoId && /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(cartaoId) ? cartaoId : null;
        
        return {
          nome: nome.trim(),
          valor: parseFloat(item.valor) || 0,
          natureza: item.natureza,
          tipo: item.tipo,
          categoria: item.categoria || item.emoji || null,
          cartao_id: cartaoIdValido,
          parcelas: item.parcelas || null,
          mes_primeira_parcela: item.mes_primeira_parcela || null,
          ano_primeira_parcela: item.ano_primeira_parcela || null,
          user_id: userId,
        };
      });

      const { error: insertError } = await supabase
        .from('itens')
        .insert(itensParaMigrar);

      if (insertError) throw insertError;

      console.log(`${itensValidos.length} itens migrados com sucesso para a nuvem!`);
    } catch (error) {
      console.error('Erro ao migrar dados locais:', error);
    }
  };

  // Sincroniza dados com Supabase
  const sincronizarComNuvem = async (userId) => {
    if (!isOnline || !userId) return;

    try {
      // Carrega do Supabase
      const { data, error } = await supabase
        .from('itens')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Converte formato do Supabase para o formato local
      const itensFormatados = data.map(item => ({
        id: item.id,
        nome: item.nome,
        valor: item.valor,
        natureza: item.natureza,
        tipo: item.tipo,
        categoria: item.categoria,
        cartaoId: item.cartao_id,
        parcelas: item.parcelas,
        mesPrimeiraParcela: item.mes_primeira_parcela,
        anoPrimeiraParcela: item.ano_primeira_parcela,
      }));

      setItens(itensFormatados);
      
      // Salva cache local
      await AsyncStorage.setItem("itens", JSON.stringify(itensFormatados));
      await AsyncStorage.setItem("itens_sync_time", new Date().toISOString());
    } catch (error) {
      console.error('Erro ao sincronizar com nuvem:', error);
      // Se falhar, carrega do cache local
      await carregarDoCacheLocal();
    }
  };

  // Carrega do cache local (modo offline)
  const carregarDoCacheLocal = async () => {
    try {
      const itensExistentes = await AsyncStorage.getItem("itens");
      if (itensExistentes) {
        const itensCarregados = JSON.parse(itensExistentes);
        
        // Normaliza itens do formato antigo para o novo
        const itensNormalizados = itensCarregados.map(item => ({
          id: item.id,
          nome: item.nome || item.descricao,
          valor: item.valor,
          natureza: item.natureza,
          tipo: item.tipo,
          categoria: item.categoria || item.emoji || null,
          cartaoId: item.cartaoId || item.cartao || null,
          parcelas: item.parcelas || null,
          mesPrimeiraParcela: item.mesPrimeiraParcela || null,
          anoPrimeiraParcela: item.anoPrimeiraParcela || null,
        }));
        
        setItens(itensNormalizados);
      } else {
        setItens([]);
      }
    } catch (error) {
      console.error("Erro ao carregar cache local:", error);
      setItens([]);
    }
  };

  const carregarItens = async (currentUserId = null) => {
    const startTime = Date.now();
    const minLoadingTime = 1500;
    const userIdToUse = currentUserId || userId;
    
    try {
      await StorageService.migrateOldCardReferences();
      
      if (userIdToUse && isOnline) {
        try {
          // Migra dados locais se for o primeiro login
          await migrarDadosLocaisParaNuvem(userIdToUse);
          // Sincroniza com nuvem
          await sincronizarComNuvem(userIdToUse);
        } catch (error) {
          console.log('Erro ao sincronizar com nuvem, usando cache local:', error.message);
          await carregarDoCacheLocal();
        }
      } else {
        // Modo offline ou sem login - usa cache local
        await carregarDoCacheLocal();
      }
    } catch (error) {
      console.error("Erro ao carregar itens:", error);
      await carregarDoCacheLocal();
    } finally {
      const elapsedTime = Date.now() - startTime;
      const remainingTime = Math.max(0, minLoadingTime - elapsedTime);
      
      setTimeout(() => {
        setLoading(false);
      }, remainingTime);
    }
  };

  // Recarrega itens
  useEffect(() => {
    // Carrega inicialmente do cache local para funcionar offline
    if (loading) {
      carregarItens(null);
    }
  }, []);

  // Sincroniza quando userId muda
  useEffect(() => {
    if (userId && !loading) {
      carregarItens(userId);
    }
  }, [userId, isOnline]);

  const recarregarItens = () => {
    carregarItens(userId);
  };

  // Adicionar item (salva no Supabase se estiver online e autenticado)
  const adicionarItem = async (item) => {
    try {
      const itemComId = {
        ...item,
        id: item.id || Date.now().toString(),
      };

      // Se estiver online e autenticado, salva no Supabase
      if (userId && isOnline) {
        const { data, error } = await supabase
          .from('itens')
          .insert([{
            nome: item.descricao || item.nome,
            valor: parseFloat(item.valor) || 0,
            natureza: item.natureza,
            tipo: item.tipo,
            categoria: item.emoji || item.categoria || null,
            cartao_id: item.cartao || item.cartaoId || null,
            parcelas: item.parcelas || null,
            mes_primeira_parcela: item.mesPrimeiraParcela || null,
            ano_primeira_parcela: item.anoPrimeiraParcela || null,
            user_id: userId,
          }])
          .select()
          .single();

        if (error) throw error;

        // Atualiza com o ID do Supabase
        itemComId.id = data.id;
      }

      // Atualiza cache local
      const novosItens = [itemComId, ...itens];
      setItens(novosItens);
      await AsyncStorage.setItem("itens", JSON.stringify(novosItens));

      // Recarrega para sincronizar
      if (userId && isOnline) {
        await sincronizarComNuvem(userId);
      }

      return { success: true };
    } catch (error) {
      console.error('Erro ao adicionar item:', error);
      return { success: false, error };
    }
  };

  // Editar item (atualiza no Supabase se estiver online e autenticado)
  const editarItem = async (id, itemAtualizado) => {
    try {
      // Se estiver online e autenticado, atualiza no Supabase
      if (userId && isOnline) {
        const { error } = await supabase
          .from('itens')
          .update({
            nome: itemAtualizado.descricao || itemAtualizado.nome,
            valor: parseFloat(itemAtualizado.valor) || 0,
            natureza: itemAtualizado.natureza,
            tipo: itemAtualizado.tipo,
            categoria: itemAtualizado.emoji || itemAtualizado.categoria || null,
            cartao_id: itemAtualizado.cartao || itemAtualizado.cartaoId || null,
            parcelas: itemAtualizado.parcelas || null,
            mes_primeira_parcela: itemAtualizado.mesPrimeiraParcela || null,
            ano_primeira_parcela: itemAtualizado.anoPrimeiraParcela || null,
          })
          .eq('id', id)
          .eq('user_id', userId);

        if (error) throw error;
      }

      // Atualiza cache local
      const itensAtualizados = itens.map(item => 
        item.id === id ? { ...item, ...itemAtualizado } : item
      );
      setItens(itensAtualizados);
      await AsyncStorage.setItem("itens", JSON.stringify(itensAtualizados));

      // Recarrega para sincronizar
      if (userId && isOnline) {
        await sincronizarComNuvem(userId);
      }

      return { success: true };
    } catch (error) {
      console.error('Erro ao editar item:', error);
      return { success: false, error };
    }
  };

  // Deletar item (remove do Supabase se estiver online e autenticado)
  const deletarItem = async (id) => {
    try {
      // Se estiver online e autenticado, deleta do Supabase
      if (userId && isOnline) {
        const { error } = await supabase
          .from('itens')
          .delete()
          .eq('id', id)
          .eq('user_id', userId);

        if (error) throw error;
      }

      // Atualiza cache local
      const itensFiltrados = itens.filter(item => item.id !== id);
      setItens(itensFiltrados);
      await AsyncStorage.setItem("itens", JSON.stringify(itensFiltrados));

      return { success: true };
    } catch (error) {
      console.error('Erro ao deletar item:', error);
      return { success: false, error };
    }
  };

  return (
    <ItensContext.Provider value={{ 
      itens, 
      loading, 
      recarregarItens, 
      isOnline, 
      userId,
      adicionarItem,
      editarItem,
      deletarItem,
    }}>
      {children}
    </ItensContext.Provider>
  );
}

export function useItens() {
  const context = useContext(ItensContext);
  if (!context) {
    throw new Error("useItens deve ser usado dentro de um ItensProvider");
  }
  return context;
}
