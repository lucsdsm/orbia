import Toast from "react-native-toast-message";

/**
 * Helper para exibir toasts de forma simplificada
 * @param {string} type - 'success' ou 'error'
 * @param {string} text1 - Texto principal
 * @param {string} text2 - Texto secundário (opcional)
 * @param {number} visibilityTime - Tempo de exibição em ms (padrão: 2000)
 */
export const showToast = (type, text1, text2 = null, visibilityTime = 2000) => {
  Toast.show({
    type,
    text1,
    text2,
    position: "top",
    visibilityTime,
  });
};
