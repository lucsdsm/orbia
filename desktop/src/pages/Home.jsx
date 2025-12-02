import { useContext, useMemo } from 'react';
import { ItensContext } from '../contexts/ItensContext';
import { CartoesContext } from '../contexts/CartoesContext';
import { SaldoContext } from '../contexts/SaldoContext';
import './Home.css';

export default function Home() {
  const { itens } = useContext(ItensContext);
  const { cartoes } = useContext(CartoesContext);
  const { saldo } = useContext(SaldoContext);

  const mesAtual = new Date().getMonth();
  const anoAtual = new Date().getFullYear();

  // Calcular receitas e despesas totais
  const totais = useMemo(() => {
    const receitas = itens
      .filter((item) => item.tipo === 'receita')
      .reduce((sum, item) => sum + (parseFloat(item.valor) || 0), 0);

    const despesas = itens
      .filter((item) => item.tipo === 'despesa')
      .reduce((sum, item) => sum + (parseFloat(item.valor) || 0), 0);

    return { receitas, despesas };
  }, [itens]);

  // Calcular superávit (total de receitas - despesas)
  const superavit = useMemo(() => {
    return totais.receitas - totais.despesas;
  }, [totais]);

  // Calcular próximo saldo
  const proximoSaldo = useMemo(() => {
    return saldo + superavit;
  }, [saldo, superavit]);

  const formatCurrency = (value) => {
    return value.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });
  };



  return (
    <div className="home-container">
      <div className="home-header">
        <h1>Bem-vindo ao Orbia</h1>
        <p>Visão geral das suas finanças</p>
      </div>

      <div className="cards-grid">
        {/* Saldo Atual */}
        <div className="info-card">
          <div className="card-header">
            <h2>Saldo Atual</h2>
          </div>
          <div className="card-content">
            <div className="saldo-display">
              <span className="saldo-value">
                {formatCurrency(saldo)}
              </span>
            </div>
          </div>
        </div>

        {/* Receitas e Despesas */}
        <div className="info-card">
          <div className="card-header">
            <h2>Receitas e Despesas</h2>
          </div>
          <div className="card-content">
            <div className="balance-item">
              <span className="label">Receitas:</span>
              <span className="value receita">
                {formatCurrency(totais.receitas)}
              </span>
            </div>
            <div className="balance-item">
              <span className="label">Despesas:</span>
              <span className="value despesa">
                {formatCurrency(totais.despesas)}
              </span>
            </div>
          </div>
        </div>

        {/* Superávit */}
        <div className="info-card">
          <div className="card-header">
            <h2>Superávit Total</h2>
          </div>
          <div className="card-content">
            <div className="superavit-display">
              <span
                className={`superavit-value ${
                  superavit >= 0 ? 'positive' : 'negative'
                }`}
              >
                {formatCurrency(superavit)}
              </span>
              <p className="superavit-desc">
                {superavit >= 0
                  ? 'Você está no positivo!'
                  : 'Suas despesas superam as receitas'}
              </p>
            </div>
          </div>
        </div>

        {/* Próximo Saldo */}
        <div className="info-card">
          <div className="card-header">
            <h2>Próximo Saldo</h2>
          </div>
          <div className="card-content">
            <div className="saldo-display">
              <span
                className={`saldo-value ${
                  proximoSaldo >= 0 ? 'positive' : 'negative'
                }`}
              >
                {formatCurrency(proximoSaldo)}
              </span>
              <p className="saldo-desc">
                {proximoSaldo >= 0
                  ? 'Previsão positiva!'
                  : 'Atenção às despesas'}
              </p>
            </div>
          </div>
        </div>

        {/* Resumo */}
        <div className="info-card">
          <div className="card-header">
            <h2>Resumo</h2>
          </div>
          <div className="card-content">
            <div className="summary-item">
              <span className="summary-label">Total de Itens:</span>
              <span className="summary-value">{itens.length}</span>
            </div>
            <div className="summary-item">
              <span className="summary-label">Total de Cartões:</span>
              <span className="summary-value">{cartoes.length}</span>
            </div>
            <div className="summary-item">
              <span className="summary-label">Receitas:</span>
              <span className="summary-value">
                {itens.filter((i) => i.tipo === 'receita').length}
              </span>
            </div>
            <div className="summary-item">
              <span className="summary-label">Despesas:</span>
              <span className="summary-value">
                {itens.filter((i) => i.tipo === 'despesa').length}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
