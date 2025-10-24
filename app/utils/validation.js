/**
 * Funções de validação para o app
*/

/**
 * Valida se todos os campos obrigatórios estão preenchidos
*/
export const validateRequiredFields = (fields) => {
  return fields.every(field => field && field.toString().trim() !== '');
};

/**
 * Valida dia de fechamento do cartão (1-31)
*/
export const validateDiaFechamento = (dia) => {
  const diaNum = parseInt(dia);
  return !isNaN(diaNum) && diaNum >= 1 && diaNum <= 31;
};

/**
 * Valida valor numérico
*/
export const validateNumericValue = (value) => {
  const num = parseFloat(value);
  return !isNaN(num) && num >= 0;
};

/**
 * Valida se há cartões cadastrados quando necessário
*/
export const validateCartoesExist = (cartoes) => {
  return cartoes && cartoes.length > 0;
};

/**
 * Mensagens de erro padrão
*/
export const ERROR_MESSAGES = {
  REQUIRED_FIELDS: 'Preencha os campos marcados com (*)',
  INVALID_DIA_FECHAMENTO: 'Digite um dia entre 1 e 31',
  NO_CARDS: 'Adicione um cartão antes de criar despesas parceladas',
  INVALID_VALUE: 'Valor inválido',
  SAVE_ERROR: 'Erro ao salvar',
  DELETE_ERROR: 'Erro ao excluir',
};
