import { useContext, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { ItensContext } from '../contexts/ItensContext';
import { CartoesContext } from '../contexts/CartoesContext';
import { toast } from 'react-toastify';
import './ItemList.css';

export default function ItemList() {
  const navigate = useNavigate();
  const { itens, deleteItem } = useContext(ItensContext);
  const { cartoes } = useContext(CartoesContext);

  const [filtroTipo, setFiltroTipo] = useState('todos');
  const [filtroMes, setFiltroMes] = useState('');
  const [filtroAno, setFiltroAno] = useState('');

  const meses = [
    'Janeiro',
    'Fevereiro',
    'Março',
    'Abril',
    'Maio',
    'Junho',
    'Julho',
    'Agosto',
    'Setembro',
    'Outubro',
    'Novembro',
    'Dezembro',
  ];

  // Obter lista de anos disponíveis
  const anosDisponiveis = useMemo(() => {
    const anos = [...new Set(itens.map((item) => new Date(item.data).getFullYear()))];
    return anos.sort((a, b) => b - a);
  }, [itens]);

  // Filtrar itens
  const itensFiltrados = useMemo(() => {
    return itens.filter((item) => {
      const dataItem = new Date(item.data);
      const mesItem = dataItem.getMonth();
      const anoItem = dataItem.getFullYear();

      const matchTipo = filtroTipo === 'todos' || item.tipo === filtroTipo;
      const matchMes = !filtroMes || mesItem === parseInt(filtroMes);
      const matchAno = !filtroAno || anoItem === parseInt(filtroAno);

      return matchTipo && matchMes && matchAno;
    });
  }, [itens, filtroTipo, filtroMes, filtroAno]);

  const handleDelete = async (id) => {
    if (window.confirm('Tem certeza que deseja excluir este item?')) {
      try {
        await deleteItem(id);
        toast.success('Item excluído com sucesso!');
      } catch (error) {
        toast.error('Erro ao excluir item');
      }
    }
  };

  const getCartaoNome = (cartaoId) => {
    const cartao = cartoes.find((c) => c.id === cartaoId);
    return cartao ? cartao.nome : 'N/A';
  };

  const formatCurrency = (value) => {
    return parseFloat(value).toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR');
  };

  return (
    <div className="itemlist-container">
      <div className="itemlist-header">
        <h1>Itens</h1>
        <button className="btn-add" onClick={() => navigate('/itens/novo')}>
          + Novo Item
        </button>
      </div>

      <div className="filters">
        <div className="filter-group">
          <label>Tipo:</label>
          <select value={filtroTipo} onChange={(e) => setFiltroTipo(e.target.value)}>
            <option value="todos">Todos</option>
            <option value="receita">Receitas</option>
            <option value="despesa">Despesas</option>
          </select>
        </div>

        <div className="filter-group">
          <label>Mês:</label>
          <select value={filtroMes} onChange={(e) => setFiltroMes(e.target.value)}>
            <option value="">Todos</option>
            {meses.map((mes, index) => (
              <option key={index} value={index}>
                {mes}
              </option>
            ))}
          </select>
        </div>

        <div className="filter-group">
          <label>Ano:</label>
          <select value={filtroAno} onChange={(e) => setFiltroAno(e.target.value)}>
            <option value="">Todos</option>
            {anosDisponiveis.map((ano) => (
              <option key={ano} value={ano}>
                {ano}
              </option>
            ))}
          </select>
        </div>

        <button
          className="btn-clear-filters"
          onClick={() => {
            setFiltroTipo('todos');
            setFiltroMes('');
            setFiltroAno('');
          }}
        >
          Limpar Filtros
        </button>
      </div>

      <div className="itemlist-stats">
        <span>
          Total de itens: <strong>{itensFiltrados.length}</strong>
        </span>
        <span>
          Receitas:{' '}
          <strong className="receita">
            {itensFiltrados.filter((i) => i.tipo === 'receita').length}
          </strong>
        </span>
        <span>
          Despesas:{' '}
          <strong className="despesa">
            {itensFiltrados.filter((i) => i.tipo === 'despesa').length}
          </strong>
        </span>
      </div>

      {itensFiltrados.length === 0 ? (
        <div className="empty-state">
          <p>Nenhum item encontrado</p>
          <button className="btn-add-empty" onClick={() => navigate('/itens/novo')}>
            Adicionar Primeiro Item
          </button>
        </div>
      ) : (
        <div className="table-container">
          <table className="itemlist-table">
            <thead>
              <tr>
                <th>Data</th>
                <th>Nome</th>
                <th>Categoria</th>
                <th>Tipo</th>
                <th>Valor</th>
                <th>Cartão</th>
                <th>Parcelas</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {itensFiltrados.map((item) => (
                <tr key={item.id}>
                  <td>{formatDate(item.data)}</td>
                  <td>{item.nome || item.descricao}</td>
                  <td>
                    <span className="categoria-badge">
                      {item.emoji || item.categoria}
                    </span>
                  </td>
                  <td>
                    <span className={`tipo-badge ${item.tipo}`}>
                      {item.tipo === 'receita' ? 'Receita' : 'Despesa'}
                    </span>
                  </td>
                  <td className={`valor ${item.tipo}`}>
                    {formatCurrency(item.valor)}
                  </td>
                  <td>{item.cartaoId ? getCartaoNome(item.cartaoId) : '-'}</td>
                  <td>
                    {item.numParcelas && item.numParcelas > 1
                      ? `${item.numParcelas}x`
                      : '-'}
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button
                        className="btn-edit"
                        onClick={() => navigate(`/itens/editar/${item.id}`)}
                      >
                        ✏️
                      </button>
                      <button
                        className="btn-delete"
                        onClick={() => handleDelete(item.id)}
                      >
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
