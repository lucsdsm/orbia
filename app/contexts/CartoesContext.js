import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { StorageService } from '../services/storage';
import { DEFAULT_CARDS } from '../constants';

const CartoesContext = createContext();

export const CartoesProvider = ({ children }) => {
  const [cartoes, setCartoes] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadCartoes = async () => {
    try {
      let cartoesCarregados = await StorageService.getCartoes();
      
      // Migração única: se ainda não migrou, migra os cartões padrão
      const migrated = await AsyncStorage.getItem('cards_migrated_v1.0.2');
      if (!migrated && cartoesCarregados.length === 0) {
        cartoesCarregados = DEFAULT_CARDS;
        await StorageService.saveCartoes(DEFAULT_CARDS);
        await AsyncStorage.setItem('cards_migrated_v1.0.2', 'true');
      }
      
      setCartoes(cartoesCarregados);
    } catch (error) {
      console.error('Erro ao carregar cartões:', error);
      setCartoes([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCartoes();
  }, []);

  const adicionarCartao = async (cartao) => {
    try {
      const novosCartoes = [...cartoes, cartao];
      await StorageService.saveCartoes(novosCartoes);
      setCartoes(novosCartoes);
      return { success: true };
    } catch (error) {
      console.error('Erro ao adicionar cartão:', error);
      return { success: false, error };
    }
  };

  const editarCartao = async (id, cartaoAtualizado) => {
    try {
      const novosCartoes = cartoes.map(cartao => 
        cartao.id === id ? { ...cartao, ...cartaoAtualizado, id } : cartao
      );
      await StorageService.saveCartoes(novosCartoes);
      setCartoes(novosCartoes);
      return { success: true };
    } catch (error) {
      console.error('Erro ao editar cartão:', error);
      return { success: false, error };
    }
  };

  const deletarCartao = async (id) => {
    try {
      const novosCartoes = cartoes.filter(cartao => cartao.id !== id);
      await StorageService.saveCartoes(novosCartoes);
      setCartoes(novosCartoes);
      return { success: true };
    } catch (error) {
      console.error('Erro ao deletar cartão:', error);
      return { success: false, error };
    }
  };

  return (
    <CartoesContext.Provider
      value={{
        cartoes,
        loading,
        loadCartoes,
        reloadCartoes: loadCartoes,
        adicionarCartao,
        editarCartao,
        deletarCartao,
      }}
    >
      {children}
    </CartoesContext.Provider>
  );
};

export const useCartoes = () => {
  const context = useContext(CartoesContext);
  if (!context) {
    throw new Error('useCartoes deve ser usado dentro de um CartoesProvider');
  }
  return context;
};
