import { useContext, useMemo, useState } from 'react';
import { ItensContext } from '../contexts/ItensContext';
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import './Charts.css';

export default function Charts() {
  const { itens } = useContext(ItensContext);
  const [anoSelecionado, setAnoSelecionado] = useState(new Date().getFullYear());

  const meses = [
    'Jan',
    'Fev',
    'Mar',
    'Abr',
    'Mai',
    'Jun',
    'Jul',
    'Ago',
    'Set',
    'Out',
    'Nov',
    'Dez',
  ];

  // Obter lista de anos disponíveis
  const anosDisponiveis = useMemo(() => {
    const anos = [...new Set(itens.map((item) => new Date(item.data).getFullYear()))];
    return anos.sort((a, b) => b - a);
  }, [itens]);

  // Dados para o gráfico de receitas vs despesas por mês
  const dadosPorMes = useMemo(() => {
    return meses.map((mes, index) => {
      const itensMes = itens.filter((item) => {
        const dataItem = new Date(item.data);
        return (
          dataItem.getMonth() === index &&
          dataItem.getFullYear() === anoSelecionado
        );
      });

      const receitas = itensMes
        .filter((i) => i.tipo === 'receita')
        .reduce((sum, i) => sum + parseFloat(i.valor), 0);

      const despesas = itensMes
        .filter((i) => i.tipo === 'despesa')
        .reduce((sum, i) => sum + parseFloat(i.valor), 0);

      return {
        mes,
        receitas,
        despesas,
        saldo: receitas - despesas,
      };
    });
  }, [itens, anoSelecionado, meses]);

  // Dados para o gráfico de pizza (categorias)
  const dadosPorCategoria = useMemo(() => {
    const categorias = {};

    itens
      .filter((item) => {
        const dataItem = new Date(item.data);
        return dataItem.getFullYear() === anoSelecionado && item.tipo === 'despesa';
      })
      .forEach((item) => {
        const categoria = item.emoji || item.categoria || 'Outros';
        if (!categorias[categoria]) {
          categorias[categoria] = 0;
        }
        categorias[categoria] += parseFloat(item.valor);
      });

    return Object.entries(categorias).map(([name, value]) => ({
      name,
      value,
    }));
  }, [itens, anoSelecionado]);

  // Cores para o gráfico de pizza
  const COLORS = [
    '#667eea',
    '#764ba2',
    '#f093fb',
    '#4facfe',
    '#00f2fe',
    '#43e97b',
    '#38f9d7',
    '#fa709a',
    '#fee140',
    '#30cfd0',
  ];

  const formatCurrency = (value) => {
    return value.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });
  };

  const totaisAno = useMemo(() => {
    const itensAno = itens.filter(
      (item) => new Date(item.data).getFullYear() === anoSelecionado
    );

    const receitas = itensAno
      .filter((i) => i.tipo === 'receita')
      .reduce((sum, i) => sum + parseFloat(i.valor), 0);

    const despesas = itensAno
      .filter((i) => i.tipo === 'despesa')
      .reduce((sum, i) => sum + parseFloat(i.valor), 0);

    return { receitas, despesas, saldo: receitas - despesas };
  }, [itens, anoSelecionado]);

  return (
    <div className="charts-container">
      <div className="charts-header">
        <h1>Gráficos e Análises</h1>
        <select
          value={anoSelecionado}
          onChange={(e) => setAnoSelecionado(parseInt(e.target.value))}
          className="year-selector"
        >
          {anosDisponiveis.map((ano) => (
            <option key={ano} value={ano}>
              {ano}
            </option>
          ))}
        </select>
      </div>

      {/* Cards com totais */}
      <div className="totals-cards">
        <div className="total-card receita-card">
          <h3>Total de Receitas</h3>
          <p className="total-value">{formatCurrency(totaisAno.receitas)}</p>
        </div>
        <div className="total-card despesa-card">
          <h3>Total de Despesas</h3>
          <p className="total-value">{formatCurrency(totaisAno.despesas)}</p>
        </div>
        <div className={`total-card ${totaisAno.saldo >= 0 ? 'saldo-positivo' : 'saldo-negativo'}`}>
          <h3>Saldo do Ano</h3>
          <p className="total-value">{formatCurrency(totaisAno.saldo)}</p>
        </div>
      </div>

      {/* Gráfico de barras - Receitas vs Despesas */}
      <div className="chart-card">
        <h2>Receitas vs Despesas por Mês</h2>
        <ResponsiveContainer width="100%" height={350}>
          <BarChart data={dadosPorMes}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="mes" />
            <YAxis />
            <Tooltip formatter={(value) => formatCurrency(value)} />
            <Legend />
            <Bar dataKey="receitas" fill="#10b981" name="Receitas" />
            <Bar dataKey="despesas" fill="#ef4444" name="Despesas" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Gráfico de linha - Saldo mensal */}
      <div className="chart-card">
        <h2>Evolução do Saldo Mensal</h2>
        <ResponsiveContainer width="100%" height={350}>
          <LineChart data={dadosPorMes}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="mes" />
            <YAxis />
            <Tooltip formatter={(value) => formatCurrency(value)} />
            <Legend />
            <Line
              type="monotone"
              dataKey="saldo"
              stroke="#667eea"
              strokeWidth={3}
              name="Saldo"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Gráfico de pizza - Despesas por categoria */}
      {dadosPorCategoria.length > 0 && (
        <div className="chart-card">
          <h2>Despesas por Categoria</h2>
          <ResponsiveContainer width="100%" height={400}>
            <PieChart>
              <Pie
                data={dadosPorCategoria}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={(entry) => `${entry.name} (${((entry.value / totaisAno.despesas) * 100).toFixed(1)}%)`}
                outerRadius={120}
                fill="#8884d8"
                dataKey="value"
              >
                {dadosPorCategoria.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => formatCurrency(value)} />
            </PieChart>
          </ResponsiveContainer>
          <div className="legend-custom">
            {dadosPorCategoria.map((item, index) => (
              <div key={index} className="legend-item">
                <div
                  className="legend-color"
                  style={{ background: COLORS[index % COLORS.length] }}
                />
                <span>{item.name}: {formatCurrency(item.value)}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
