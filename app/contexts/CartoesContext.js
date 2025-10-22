import React, { createContext, useState, useEffect, useContext } from 'react';
import { StorageService } from '../services/storage';
import { DEFAULT_CARDS } from '../constants';

const CartoesContext = createContext();

export const CartoesProvider = ({ children }) => {
  const [cartoes, setCartoes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadCartoes();
  }, []);

  const loadCartoes = async () => {
    try {
      await StorageService.initializeDefaultCards(DEFAULT_CARDS);
      const cards = await StorageService.getCards();
      setCartoes(cards);
    } catch (error) {
      console.error('Erro ao carregar cartões:', error);
    } finally {
      setLoading(false);
    }
  };

  const addCartao = async (cartao) => {
    try {
      await StorageService.saveCard(cartao);
      await loadCartoes();
    } catch (error) {
      console.error('Erro ao adicionar cartão:', error);
      throw error;
    }
  };

  const updateCartao = async (id, cartaoAtualizado) => {
    try {
      await StorageService.updateCard(id, cartaoAtualizado);
      await loadCartoes();
    } catch (error) {
      console.error('Erro ao atualizar cartão:', error);
      throw error;
    }
  };

  const deleteCartao = async (id) => {
    try {
      await StorageService.deleteCard(id);
      await loadCartoes();
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
