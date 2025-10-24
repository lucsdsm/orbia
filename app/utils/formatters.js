/**
 * Funções de formatação de valores
*/

/**
 * Formata valor monetário para exibição
*/
export const formatCurrency = (value) => {
  const num = parseFloat(value) || 0;
  return num.toFixed(2);
};

/**
 * Limpa valor permitindo apenas números e ponto
*/
export const cleanNumericInput = (text) => {
  const cleaned = text.replace(/[^0-9.]/g, "");
  // Impede múltiplos pontos
  if (cleaned.split(".").length > 2) return text;
  return cleaned;
};

/**
 * Formata valor para número com 2 casas decimais
*/
export const formatToDecimal = (value) => {
  let num = parseFloat(value);
  if (isNaN(num) || num < 0) num = 0;
  return num.toFixed(2);
};

/**
 * Limpa entrada permitindo apenas números
*/
export const cleanIntegerInput = (text, maxLength = null) => {
  const cleaned = text.replace(/[^0-9]/g, "");
  if (maxLength && cleaned.length > maxLength) {
    return cleaned.slice(0, maxLength);
  }
  return cleaned;
};

/**
 * Converte hex para rgba
*/
export const hexToRgba = (hex, opacity) => {
  hex = hex.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
};
