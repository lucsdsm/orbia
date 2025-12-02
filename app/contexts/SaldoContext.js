import React, { createContext, useState, useContext, useEffect } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { saldoEmitter, SALDO_EVENTS } from "../events/saldoEvents";

const SaldoContext = createContext();

export function SaldoProvider({ children }) {
  const [saldo, setSaldo] = useState(0);
  const [loading, setLoading] = useState(true);

  // Carrega do AsyncStorage
  const carregarSaldo = async () => {
    try {
      const saldoSalvo = await AsyncStorage.getItem("@orbia:saldo");
      if (saldoSalvo !== null) {
        setSaldo(parseFloat(saldoSalvo));
      }
    } catch (error) {
      console.error("Erro ao carregar saldo:", error);
    } finally {
      setLoading(false);
    }
  };

  // Carrega saldo ao iniciar
  useEffect(() => {
    carregarSaldo();
  }, []);

  // Atualizar saldo
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
      carregarSaldo
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
