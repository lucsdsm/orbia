import { useMemo } from 'react';

/**
 * Hook que gera opções de anos para pickers
 * @param {number} futureYears - quantos anos no futuro gerar
 */
export const useYearOptions = (futureYears = 3) => {
  return useMemo(() => {
    const currentYear = new Date().getFullYear();
    return Array.from({ length: futureYears + 1 }, (_, i) => ({
      label: (currentYear + i).toString(),
      value: currentYear + i,
    }));
  }, [futureYears]);
};
