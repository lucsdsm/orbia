import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

/**
 * Serviço para gerenciar notificação persistente com informações financeiras
 */

// Configuração de como as notificações devem ser apresentadas
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

const NOTIFICATION_ID = 'orbia-widget-notification';

/**
 * Solicita permissões de notificação
 */
export const requestNotificationPermissions = async () => {
  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    
    if (finalStatus !== 'granted') {
      console.log('Permissão de notificação negada');
      return false;
    }
    
    // Configurar canal de notificação para Android
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('orbia-widget', {
        name: 'Widget Orbia',
        importance: Notifications.AndroidImportance.LOW, // LOW para notificação persistente sem som
        vibrationPattern: [0],
        sound: null,
        enableVibrate: false,
        showBadge: false,
        lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
      });
    }
    
    return true;
  } catch (error) {
    console.error('Erro ao solicitar permissões:', error);
    return false;
  }
};

/**
 * Cria ou atualiza a notificação persistente
 */
export const updateWidgetNotification = async (saldo, superavite, saldoProximo) => {
  try {
    // Cancela notificação anterior se existir
    await cancelWidgetNotification();
    
    const superaviteTexto = superavite >= 0 
      ? `+R$ ${superavite.toFixed(2)}` 
      : `-R$ ${Math.abs(superavite).toFixed(2)}`;
    
    const saldoProximoTexto = saldoProximo >= 0
      ? `+R$ ${saldoProximo.toFixed(2)}`
      : `-R$ ${Math.abs(saldoProximo).toFixed(2)}`;
    
    const notificationContent = {
      title: '🪐 Orbia',
      body: `💰 Saldo: R$ ${saldo.toFixed(2)}\n${superavite >= 0 ? '📈' : '📉'} Superávite: ${superaviteTexto}\n🔮 Próximo mês: ${saldoProximoTexto}`,
      data: { 
        id: NOTIFICATION_ID,
        screen: 'Home',
      },
      sticky: Platform.OS === 'android', // Notificação fixa apenas no Android
      priority: Platform.OS === 'android' ? 'low' : 'default',
      sound: null,
      badge: 0,
    };

    // Configurações específicas do Android
    if (Platform.OS === 'android') {
      notificationContent.channelId = 'orbia-widget';
      notificationContent.ongoing = true; // Torna a notificação persistente
    }
    
    await Notifications.scheduleNotificationAsync({
      content: notificationContent,
      trigger: null, // null = exibir imediatamente
      identifier: NOTIFICATION_ID,
    });
    
    return true;
  } catch (error) {
    console.error('Erro ao criar notificação:', error);
    return false;
  }
};

/**
 * Cancela a notificação persistente
 */
export const cancelWidgetNotification = async () => {
  try {
    // Cancela todas as notificações apresentadas
    const notifications = await Notifications.getPresentedNotificationsAsync();
    const orbiaNotification = notifications.find(n => n.request.identifier === NOTIFICATION_ID);
    
    if (orbiaNotification) {
      await Notifications.dismissNotificationAsync(orbiaNotification.request.identifier);
    }
    
    // Cancela notificações agendadas
    await Notifications.cancelScheduledNotificationAsync(NOTIFICATION_ID);
    
    return true;
  } catch (error) {
    console.error('Erro ao cancelar notificação:', error);
    return false;
  }
};

/**
 * Verifica se o widget está ativo
 */
export const isWidgetActive = async () => {
  try {
    const notifications = await Notifications.getPresentedNotificationsAsync();
    return notifications.some(n => n.request.identifier === NOTIFICATION_ID);
  } catch (error) {
    console.error('Erro ao verificar widget:', error);
    return false;
  }
};

/**
 * Adiciona listener para quando o usuário tocar na notificação
 */
export const addNotificationResponseListener = (callback) => {
  return Notifications.addNotificationResponseReceivedListener((response) => {
    const data = response.notification.request.content.data;
    if (data.id === NOTIFICATION_ID && callback) {
      callback(data);
    }
  });
};
