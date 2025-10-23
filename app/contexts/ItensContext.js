import React, { createContext, useState, useContext, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { StorageService } from "../services/storage";

const ItensContext = createContext();

export function ItensProvider({ children }) {
  const [itens, setItens] = useState([]);
  const [loading, setLoading] = useState(true);

  const carregarItens = async () => {
    const startTime = Date.now();
    const minLoadingTime = 1500; // 1.5 segundos mínimo
    
    try {
      // executa migração ate de carregar os itens
      await StorageService.migrateOldCardReferences();
      
      const itensExistentes = await AsyncStorage.getItem("itens");
      if (itensExistentes) {
        const itensCarregados = JSON.parse(itensExistentes);
        setItens(itensCarregados);
      } else {
        setItens([]);
      }
    } catch (error) {
      console.error("Erro ao carregar itens:", error);
      setItens([]);
    } finally {
      // garante que a tela de loading fique visível por pelo menos 1.5s
      const elapsedTime = Date.now() - startTime;
      const remainingTime = Math.max(0, minLoadingTime - elapsedTime);
      
      setTimeout(() => {
        setLoading(false);
      }, remainingTime);
    }
  };

  // carrega os itens ao iniciar o app
  useEffect(() => {
    carregarItens();
  }, []);

  const recarregarItens = () => {
    carregarItens();
  };

  return (
    <ItensContext.Provider value={{ itens, loading, recarregarItens }}>
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
