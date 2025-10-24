import { useState, useEffect, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  requestNotificationPermissions,
  updateWidgetNotification,
  cancelWidgetNotification,
  isWidgetActive,
  addNotificationResponseListener,
} from '../services/NotificationService';
import { saldoEmitter, SALDO_EVENTS } from '../events/saldoEvents';

const STORAGE_KEY = '@orbia:widget_enabled';

/**
 * Hook customizado para gerenciar o widget de notificação
 */
export const useNotificationWidget = (saldo, superavite, saldoProximo) => {
  const [widgetEnabled, setWidgetEnabled] = useState(false);
  const [hasPermission, setHasPermission] = useState(false);
  const [loading, setLoading] = useState(true);

  // Carrega o estado salvo do widget
  useEffect(() => {
    const loadWidgetState = async () => {
      try {
        const saved = await AsyncStorage.getItem(STORAGE_KEY);
        const enabled = saved === 'true';
        setWidgetEnabled(enabled);
        
        // Verifica permissões apenas se estava habilitado
        if (enabled) {
          const permission = await requestNotificationPermissions();
          setHasPermission(permission);
          
          // Se estava habilitado e tem permissão, reativa após reload
          if (permission) {
            await updateWidgetNotification(saldo, superavite, saldoProximo);
          } else {
            // Se perdeu permissão, desativa
            setWidgetEnabled(false);
            await AsyncStorage.setItem(STORAGE_KEY, 'false');
          }
        }
      } catch (error) {
        console.error('Erro ao carregar estado do widget:', error);
      } finally {
        setLoading(false);
      }
    };

    loadWidgetState();
  }, []);

  // Atualiza a notificação quando os valores mudam
  useEffect(() => {
    if (widgetEnabled && hasPermission && !loading) {
      updateWidgetNotification(saldo, superavite, saldoProximo);
    }
  }, [saldo, superavite, saldoProximo, widgetEnabled, hasPermission, loading]);

  // Ouve mudanças no saldo através do event emitter
  useEffect(() => {
    const handleSaldoChange = async (novoSaldo) => {
      if (widgetEnabled && hasPermission) {
        // Recalcula superavite e saldo próximo com novo saldo
        const novoSaldoProximo = novoSaldo + superavite;
        await updateWidgetNotification(novoSaldo, superavite, novoSaldoProximo);
      }
    };

    saldoEmitter.on(SALDO_EVENTS.SALDO_CHANGED, handleSaldoChange);

    return () => {
      saldoEmitter.off(SALDO_EVENTS.SALDO_CHANGED, handleSaldoChange);
    };
  }, [widgetEnabled, hasPermission, superavite]);

  // Função para habilitar/desabilitar o widget
  const toggleWidget = useCallback(async () => {
    try {
      if (!hasPermission) {
        const permission = await requestNotificationPermissions();
        setHasPermission(permission);
        
        if (!permission) {
          return {
            success: false,
            message: 'Permissão de notificação negada',
          };
        }
      }

      const newState = !widgetEnabled;
      
      if (newState) {
        // Habilitar widget
        const success = await updateWidgetNotification(saldo, superavite, saldoProximo);
        if (success) {
          setWidgetEnabled(true);
          await AsyncStorage.setItem(STORAGE_KEY, 'true');
          return {
            success: true,
            message: 'Widget ativado com sucesso!',
          };
        } else {
          return {
            success: false,
            message: 'Erro ao ativar widget',
          };
        }
      } else {
        // Desabilitar widget
        const success = await cancelWidgetNotification();
        if (success) {
          setWidgetEnabled(false);
          await AsyncStorage.setItem(STORAGE_KEY, 'false');
          return {
            success: true,
            message: 'Widget desativado',
          };
        } else {
          return {
            success: false,
            message: 'Erro ao desativar widget',
          };
        }
      }
    } catch (error) {
      console.error('Erro ao alternar widget:', error);
      return {
        success: false,
        message: 'Erro ao alternar widget',
      };
    }
  }, [widgetEnabled, hasPermission, saldo, superavite, saldoProximo]);

  // Verifica se o widget está realmente ativo
  const checkWidgetStatus = useCallback(async () => {
    const active = await isWidgetActive();
    if (active !== widgetEnabled) {
      setWidgetEnabled(active);
      await AsyncStorage.setItem(STORAGE_KEY, active.toString());
    }
    return active;
  }, [widgetEnabled]);

  // Atualiza manualmente o widget
  const refreshWidget = useCallback(async () => {
    if (widgetEnabled && hasPermission) {
      return await updateWidgetNotification(saldo, superavite, saldoProximo);
    }
    return false;
  }, [widgetEnabled, hasPermission, saldo, superavite, saldoProximo]);

  return {
    widgetEnabled,
    hasPermission,
    loading,
    toggleWidget,
    checkWidgetStatus,
    refreshWidget,
  };
};

/**
 * Hook para adicionar listener de resposta à notificação
 */
export const useNotificationListener = (navigation) => {
  useEffect(() => {
    const subscription = addNotificationResponseListener((data) => {
      // Navega para a tela especificada
      if (data.screen && navigation) {
        navigation.navigate(data.screen);
      }
    });

    return () => subscription.remove();
  }, [navigation]);
};
