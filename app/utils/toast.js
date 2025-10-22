import Toast from "react-native-toast-message";

// helper para toasts otimizados (sem animações pesadas)
export const showToast = {
  success: (text1, text2 = null) => {
    Toast.show({
      type: "success",
      text1,
      text2,
      position: "top",
    });
  },
  
  error: (text1, text2 = null) => {
    Toast.show({
      type: "error",
      text1,
      text2,
      position: "top",
    });
  },
};
