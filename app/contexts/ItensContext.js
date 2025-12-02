import React, { createContext, useState, useContext, useEffect } from "react";
import { StorageService } from "../services/storage";

const ItensContext = createContext();

export function ItensProvider({ children }) {
  const [itens, setItens] = useState([]);
  const [loading, setLoading] = useState(true);

  const carregarItens = async () => {
    const startTime = Date.now();
    const minLoadingTime = 1500; // 1.5 segundos mínimo
    
    try {
      const itensCarregados = await StorageService.getItems();
      setItens(itensCarregados || []);
    } catch (error) {
      console.error("Erro ao carregar itens:", error);
      setItens([]);
    } finally {
      // Garante que o loading será exibido por pelo menos minLoadingTime
      const elapsedTime = Date.now() - startTime;
      const remainingTime = Math.max(0, minLoadingTime - elapsedTime);
      
      setTimeout(() => {
        setLoading(false);
      }, remainingTime);
    }
  };

  useEffect(() => {
    carregarItens();
  }, []);

  const adicionarItem = async (item) => {
    try {
      await StorageService.saveItem(item);
      await carregarItens();
      return { success: true };
    } catch (error) {
      console.error('Erro ao adicionar item:', error);
      return { success: false, error };
    }
  };

  const editarItem = async (id, itemAtualizado) => {
    try {
      await StorageService.updateItem(id, itemAtualizado);
      await carregarItens();
      return { success: true };
    } catch (error) {
      console.error('Erro ao editar item:', error);
      return { success: false, error };
    }
  };

  const deletarItem = async (id) => {
    try {
      await StorageService.deleteItem(id);
      await carregarItens();
      return { success: true };
    } catch (error) {
      console.error('Erro ao deletar item:', error);
      return { success: false, error };
    }
  };

  return (
    <ItensContext.Provider
      value={{
        itens,
        loading,
        carregarItens,
        recarregarItens: carregarItens,
        adicionarItem,
        editarItem,
        deletarItem,
      }}
    >
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
