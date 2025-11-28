/**
 * Funções de cálculo para parcelas e limites
*/

/**
 * Calcula quantas parcelas já foram pagas
*/
export const calcularParcelasPagas = (mesPrimeiraParcela, anoPrimeiraParcela) => {
  if (!mesPrimeiraParcela || !anoPrimeiraParcela) return 0;
  
  const hoje = new Date();
  const mesAtual = hoje.getMonth() + 1;
  const anoAtual = hoje.getFullYear();
  
  const mesesPassados = (anoAtual - anoPrimeiraParcela) * 12 + (mesAtual - mesPrimeiraParcela);
  return Math.max(0, mesesPassados);
};

/**
 * Calcula quantas parcelas restam
*/
export const calcularParcelasRestantes = (totalParcelas, mesPrimeiraParcela, anoPrimeiraParcela) => {
  const pagas = calcularParcelasPagas(mesPrimeiraParcela, anoPrimeiraParcela);
  return Math.max(0, totalParcelas - pagas);
};

/**
 * Calcula o valor total das parcelas restantes
*/
export const calcularValorParcelasRestantes = (valorParcela, totalParcelas, mesPrimeiraParcela, anoPrimeiraParcela) => {
  const restantes = calcularParcelasRestantes(totalParcelas, mesPrimeiraParcela, anoPrimeiraParcela);
  return valorParcela * restantes;
};

/**
 * Calcula o mês/ano final de um parcelamento
*/
export const calcularMesFinal = (mesPrimeiraParcela, anoPrimeiraParcela, totalParcelas) => {
  if (!mesPrimeiraParcela || !anoPrimeiraParcela || !totalParcelas) return null;

  const dataInicial = new Date(anoPrimeiraParcela, mesPrimeiraParcela - 1, 1);
  dataInicial.setMonth(dataInicial.getMonth() + totalParcelas - 1);

  return {
    mes: dataInicial.getMonth() + 1,
    ano: dataInicial.getFullYear(),
  };
};

/**
 * Calcula o gasto total de um item (considerando apenas parcelas restantes)
*/
export const calcularGastoItem = (item) => {
  if (!item) return 0;
  
  const valor = parseFloat(item.valor) || 0;
  const mesPrimeiraParcela = item.mesPrimeiraParcela || item.mes_primeira_parcela;
  const anoPrimeiraParcela = item.anoPrimeiraParcela || item.ano_primeira_parcela;
  
  if (item.tipo === 'parcelada' && item.parcelas && mesPrimeiraParcela && anoPrimeiraParcela) {
    return calcularValorParcelasRestantes(
      valor,
      parseInt(item.parcelas, 10) || 0,
      mesPrimeiraParcela,
      anoPrimeiraParcela
    );
  }
  
  return valor;
};

/**
 * Calcula o percentual de limite utilizado
*/
export const calcularPercentualLimite = (gastoTotal, limite) => {
  if (!limite || limite <= 0) return 0;
  return Math.min((gastoTotal / limite) * 100, 100);
};
