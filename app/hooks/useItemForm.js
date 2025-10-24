import { useState, useCallback, useMemo } from 'react';
import { validateRequiredFields, validateCartoesExist, ERROR_MESSAGES } from '../utils/validation';
import { cleanNumericInput, formatToDecimal } from '../utils/formatters';

/**
 * Hook customizado para gerenciar formulário de itens.
 */
export const useItemForm = (initialValues = {}, natureza = 'despesa') => {
  const [descricao, setDescricao] = useState(initialValues.descricao || '');
  const [emoji, setEmoji] = useState(initialValues.emoji || '');
  const [valor, setValor] = useState(initialValues.valor ? initialValues.valor.toString() : '');
  const [tipo, setTipo] = useState(initialValues.tipo || 'fixa');
  const [cartao, setCartao] = useState(initialValues.cartao || '');
  const [mesPrimeiraParcela, setMesPrimeiraParcela] = useState(
    initialValues.mesPrimeiraParcela ? initialValues.mesPrimeiraParcela.toString() : ''
  );
  const [anoPrimeiraParcela, setAnoPrimeiraParcela] = useState(
    initialValues.anoPrimeiraParcela ? initialValues.anoPrimeiraParcela.toString() : ''
  );
  const [parcelas, setParcelas] = useState(
    initialValues.parcelas ? initialValues.parcelas.toString() : ''
  );

  // handlers
  const handleValorChange = useCallback((text) => {
    const cleaned = cleanNumericInput(text);
    setValor(cleaned);
  }, []);

  const handleValorBlur = useCallback(() => {
    setValor(formatToDecimal(valor));
  }, [valor]);

  const handleTipoChange = useCallback((newTipo, cartoes) => {
    // valida se há cartões quando seleciona parcelada
    if (newTipo === 'parcelada' && !validateCartoesExist(cartoes)) {
      return { valid: false, message: ERROR_MESSAGES.NO_CARDS };
    }

    setTipo(newTipo);
    
    // auto-seleciona primeiro cartão se parcelada
    if (newTipo === 'parcelada' && cartoes.length > 0) {
      setCartao(cartoes[0].id);
    } else {
      setCartao('');
    }
    
    // limpa campos de parcela se fixa
    if (newTipo === 'fixa') {
      setMesPrimeiraParcela('');
      setAnoPrimeiraParcela('');
      setParcelas('');
    }

    return { valid: true };
  }, []);

  // validação
  const validate = useCallback(() => {
    if (!validateRequiredFields([descricao, valor])) {
      return { valid: false, message: ERROR_MESSAGES.REQUIRED_FIELDS };
    }

    if (tipo === 'parcelada' && natureza === 'despesa') {
      if (!validateRequiredFields([mesPrimeiraParcela, anoPrimeiraParcela, parcelas, cartao])) {
        return { 
          valid: false, 
          message: 'Mês, ano, cartão e parcelas são obrigatórios' 
        };
      }
    }

    return { valid: true };
  }, [descricao, valor, tipo, natureza, mesPrimeiraParcela, anoPrimeiraParcela, parcelas, cartao]);

  // obtém valores do formulário
  const getFormValues = useCallback(() => ({
    natureza: natureza.toLowerCase(),
    descricao,
    emoji,
    valor: parseFloat(valor),
    tipo,
    cartao,
    mesPrimeiraParcela: parseInt(mesPrimeiraParcela) || 0,
    anoPrimeiraParcela: parseInt(anoPrimeiraParcela) || 0,
    parcelas: parseInt(parcelas) || 0,
  }), [natureza, descricao, emoji, valor, tipo, cartao, mesPrimeiraParcela, anoPrimeiraParcela, parcelas]);

  return {
    // Estados
    descricao,
    emoji,
    valor,
    tipo,
    cartao,
    mesPrimeiraParcela,
    anoPrimeiraParcela,
    parcelas,
    
    // Setters
    setDescricao,
    setEmoji,
    setValor,
    setTipo,
    setCartao,
    setMesPrimeiraParcela,
    setAnoPrimeiraParcela,
    setParcelas,
    
    // Handlers
    handleValorChange,
    handleValorBlur,
    handleTipoChange,
    
    // Utilidades
    validate,
    getFormValues,
  };
};
