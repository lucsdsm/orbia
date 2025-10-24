import { useState, useCallback } from 'react';
import { validateRequiredFields, validateDiaFechamento, ERROR_MESSAGES } from '../utils/validation';
import { cleanNumericInput, cleanIntegerInput, formatToDecimal } from '../utils/formatters';

/**
 * Hook customizado para gerenciar formulário de cartões.
 */
export const useCardForm = (initialValues = {}) => {
  const [nome, setNome] = useState(initialValues.nome || '');
  const [emoji, setEmoji] = useState(initialValues.emoji || '');
  const [color, setColor] = useState(initialValues.color || null);
  const [limite, setLimite] = useState(initialValues.limite ? initialValues.limite.toString() : '');
  const [diaFechamento, setDiaFechamento] = useState(
    initialValues.diaFechamento ? initialValues.diaFechamento.toString() : ''
  );

  // handlers para inputs
  const handleLimiteChange = useCallback((text) => {
    const cleaned = cleanNumericInput(text);
    setLimite(cleaned);
  }, []);

  const handleLimiteBlur = useCallback(() => {
    setLimite(formatToDecimal(limite));
  }, [limite]);

  const handleDiaFechamentoChange = useCallback((text) => {
    const cleaned = cleanIntegerInput(text, 2);
    setDiaFechamento(cleaned);
  }, []);

  // validação do formulário
  const validate = useCallback(() => {
    if (!validateRequiredFields([nome, limite, diaFechamento])) {
      return { valid: false, message: ERROR_MESSAGES.REQUIRED_FIELDS };
    }

    if (!validateDiaFechamento(diaFechamento)) {
      return { valid: false, message: ERROR_MESSAGES.INVALID_DIA_FECHAMENTO };
    }

    return { valid: true };
  }, [nome, limite, diaFechamento]);

  // obtém os valores do formulário
  const getFormValues = useCallback(() => ({
    nome: nome.trim(),
    emoji: emoji.trim(),
    color,
    limite: parseFloat(limite) || 0,
    diaFechamento: parseInt(diaFechamento),
  }), [nome, emoji, color, limite, diaFechamento]);

  // reseta o formulário
  const reset = useCallback(() => {
    setNome('');
    setEmoji('');
    setLimite('');
    setDiaFechamento('');
  }, []);

  return {
    // Estados
    nome,
    emoji,
    color,
    limite,
    diaFechamento,
    
    // Setters
    setNome,
    setEmoji,
    setColor,
    setLimite,
    setDiaFechamento,
    
    // Handlers
    handleLimiteChange,
    handleLimiteBlur,
    handleDiaFechamentoChange,
    
    // Utilidades
    validate,
    getFormValues,
    reset,
  };
};
