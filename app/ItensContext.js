import React, { createContext, useState, useContext, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";

const ItensContext = createContext();

export function ItensProvider({ children }) {
  const [itens, setItens] = useState([]);
  const [loading, setLoading] = useState(true);

  const carregarItens = async () => {
    try {
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
      setLoading(false);
    }
  };

  // Carrega os itens ao iniciar o app
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
