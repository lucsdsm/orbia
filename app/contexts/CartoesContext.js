import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StorageService } from '../services/storage';
import { DEFAULT_CARDS } from '../constants';
import { supabase } from '../services/supabase';
import NetInfo from '@react-native-community/netinfo';

const CartoesContext = createContext();

export const CartoesProvider = ({ children }) => {
  const [cartoes, setCartoes] = useState([]);
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
        console.log('Erro ao verificar sessão (CartoesContext):', error.message);
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
          loadCartoes(newUserId);
        }
      });
      subscription = data.subscription;
    } catch (error) {
      console.log('Erro ao configurar listener de auth (CartoesContext):', error.message);
    }

    return () => {
      if (subscription) {
        subscription.unsubscribe();
      }
    };
  }, []);

  // Migra cartões locais para Supabase
  const migrarCartoesLocaisParaNuvem = async (userId) => {
    try {
      // Verifica se acabamos de limpar os dados (flag de controle)
      const dadosLimpos = await AsyncStorage.getItem("@orbia:dados_limpos");
      if (dadosLimpos === "true") {
        console.log('Migração de cartões cancelada: dados foram limpos recentemente');
        return;
      }
      
      const cartoesLocais = await AsyncStorage.getItem('cartoes');
      if (!cartoesLocais) return;

      const cartoes = JSON.parse(cartoesLocais);
      if (cartoes.length === 0) return;

      // Verifica se já existem cartões na nuvem
      const { data: cartoesNuvem, error } = await supabase
        .from('cartoes')
        .select('id')
        .eq('user_id', userId)
        .limit(1);

      if (error) throw error;

      // Se já tem dados na nuvem, não migra
      if (cartoesNuvem && cartoesNuvem.length > 0) return;

      // Filtra e valida cartões antes de migrar
      const cartoesValidos = cartoes.filter(cartao => {
        // Valida campo obrigatório
        if (!cartao.nome || cartao.nome.trim() === '') return false;
        return true;
      });

      if (cartoesValidos.length === 0) {
        console.log('Nenhum cartão válido para migrar');
        return;
      }

      // Migra cartões locais para nuvem (sem especificar ID, deixa o Supabase gerar)
      const cartoesParaMigrar = cartoesValidos.map(cartao => {
        // Mapeia campos antigos para novos
        const cor = cartao.cor || cartao.color || null;
        
        return {
          nome: cartao.nome.trim(),
          limite: cartao.limite || null,
          cor: cor,
          emoji: cartao.emoji || null,
          dia_fechamento: cartao.diaFechamento || cartao.dia_fechamento || null,
          user_id: userId,
        };
      });

      const { data: cartoesInseridos, error: insertError } = await supabase
        .from('cartoes')
        .insert(cartoesParaMigrar)
        .select();

      if (insertError) throw insertError;

      // Atualiza os IDs locais com os IDs gerados pelo Supabase
      if (cartoesInseridos && cartoesInseridos.length > 0) {
        const cartoesAtualizados = cartoesInseridos.map(cartao => ({
          id: cartao.id,
          nome: cartao.nome,
          limite: cartao.limite,
          cor: cartao.cor,
        }));
        
        await AsyncStorage.setItem('cartoes', JSON.stringify(cartoesAtualizados));
        
        // Atualiza as referências de cartão nos itens
        await atualizarReferenciasCartoes(cartoesValidos, cartoesInseridos);
      }

      console.log(`${cartoesValidos.length} cartões migrados com sucesso para a nuvem!`);
    } catch (error) {
      console.error('Erro ao migrar cartões locais:', error);
    }
  };

  // Atualiza referências de cartões nos itens após migração
  const atualizarReferenciasCartoes = async (cartoesAntigos, cartoesNovos) => {
    try {
      const itensLocais = await AsyncStorage.getItem('itens');
      if (!itensLocais) return;

      const itens = JSON.parse(itensLocais);
      
      // Cria mapeamento de nome -> novo ID
      const mapeamento = {};
      cartoesAntigos.forEach((cartaoAntigo, index) => {
        if (cartoesNovos[index]) {
          mapeamento[cartaoAntigo.nome] = cartoesNovos[index].id;
        }
      });

      // Atualiza os itens com os novos IDs
      const itensAtualizados = itens.map(item => {
        if (item.cartaoId) {
          const cartaoAntigo = cartoesAntigos.find(c => c.id === item.cartaoId);
          if (cartaoAntigo && mapeamento[cartaoAntigo.nome]) {
            return { ...item, cartaoId: mapeamento[cartaoAntigo.nome] };
          }
        }
        return item;
      });

      await AsyncStorage.setItem('itens', JSON.stringify(itensAtualizados));
    } catch (error) {
      console.error('Erro ao atualizar referências de cartões:', error);
    }
  };

  // Sincroniza com Supabase
  const sincronizarComNuvem = async (userId) => {
    if (!isOnline || !userId) return;

    try {
      // Carrega cartões do Supabase
      const { data, error } = await supabase
        .from('cartoes')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      // Converte formato do Supabase para o formato local
      const cartoesFormatados = data.map(cartao => ({
        id: cartao.id,
        nome: cartao.nome,
        limite: cartao.limite,
        cor: cartao.cor,
        emoji: cartao.emoji,
        diaFechamento: cartao.dia_fechamento,
      }));

      setCartoes(cartoesFormatados);
      
      // Salva cache local
      await AsyncStorage.setItem('cartoes', JSON.stringify(cartoesFormatados));
    } catch (error) {
      console.error('Erro ao sincronizar cartões com nuvem:', error);
      // Se falhar, carrega do cache local
      await carregarDoCacheLocal();
    }
  };

  // Carrega do cache local
  const carregarDoCacheLocal = async () => {
    try {
      await StorageService.initializeDefaultCards(DEFAULT_CARDS);
      const cards = await StorageService.getCards();
      
      // Normaliza cartões do formato antigo para o novo
      const cartoesNormalizados = cards.map(cartao => ({
        id: cartao.id,
        nome: cartao.nome,
        limite: cartao.limite,
        cor: cartao.cor || cartao.color || null,
        emoji: cartao.emoji || null,
        diaFechamento: cartao.diaFechamento || cartao.dia_fechamento || null,
      }));
      
      setCartoes(cartoesNormalizados);
    } catch (error) {
      console.error('Erro ao carregar cartões do cache:', error);
    }
  };

  const loadCartoes = async (currentUserId = null) => {
    const userIdToUse = currentUserId || userId;
    
    try {
      if (userIdToUse && isOnline) {
        try {
          // Migra cartões locais se for o primeiro login
          await migrarCartoesLocaisParaNuvem(userIdToUse);
          // Sincroniza com nuvem
          await sincronizarComNuvem(userIdToUse);
        } catch (error) {
          console.log('Erro ao sincronizar cartões com nuvem, usando cache local:', error.message);
          await carregarDoCacheLocal();
        }
      } else {
        // Modo offline ou sem login
        await carregarDoCacheLocal();
      }
    } catch (error) {
      console.error('Erro ao carregar cartões:', error);
      await carregarDoCacheLocal();
    } finally {
      setLoading(false);
    }
  };

  // Recarrega cartões quando userId ou isOnline muda
  useEffect(() => {
    if (userId !== null) {
      loadCartoes(userId);
    } else {
      loadCartoes();
    }
  }, [userId, isOnline]);

  const addCartao = async (cartao) => {
    try {
      let cartaoId = cartao.id;
      
      if (userId && isOnline) {
        // Salva no Supabase (sem especificar ID, deixa o Supabase gerar UUID)
        const { data, error } = await supabase
          .from('cartoes')
          .insert([{
            nome: cartao.nome,
            limite: cartao.limite || null,
            cor: cartao.cor || null,
            emoji: cartao.emoji || null,
            dia_fechamento: cartao.diaFechamento || null,
            user_id: userId,
          }])
          .select()
          .single();

        if (error) throw error;
        
        // Usa o ID gerado pelo Supabase
        cartaoId = data.id;
        cartao.id = data.id;
      }
      
      // Salva no cache local com o ID correto
      await StorageService.saveCard(cartao);
      await loadCartoes(userId);
    } catch (error) {
      console.error('Erro ao adicionar cartão:', error);
      throw error;
    }
  };

  const updateCartao = async (id, cartaoAtualizado) => {
    try {
      if (userId && isOnline) {
        // Atualiza no Supabase
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
          .eq('user_id', userId);

        if (error) throw error;
      }
      
      // Atualiza no cache local
      await StorageService.updateCard(id, cartaoAtualizado);
      await loadCartoes(userId);
    } catch (error) {
      console.error('Erro ao atualizar cartão:', error);
      throw error;
    }
  };

  const deleteCartao = async (id) => {
    try {
      if (userId && isOnline) {
        // Deleta do Supabase
        const { error } = await supabase
          .from('cartoes')
          .delete()
          .eq('id', id)
          .eq('user_id', userId);

        if (error) throw error;
      }
      
      // Deleta do cache local
      await StorageService.deleteCard(id);
      await loadCartoes(userId);
    } catch (error) {
      console.error('Erro ao deletar cartão:', error);
      throw error;
    }
  };

  return (
    <CartoesContext.Provider
      value={{
        cartoes,
        loading,
        addCartao,
        updateCartao,
        deleteCartao,
        reloadCartoes: loadCartoes,
        isOnline,
        userId,
      }}
    >
      {children}
    </CartoesContext.Provider>
  );
};

export const useCartoes = () => {
  const context = useContext(CartoesContext);
  if (!context) {
    throw new Error('useCartoes deve ser usado dentro de CartoesProvider');
  }
  return context;
};
