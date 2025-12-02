import { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { CartoesContext } from '../contexts/CartoesContext';
import { toast } from 'react-toastify';
import './CardList.css';

export default function CardList() {
  const navigate = useNavigate();
  const { cartoes, deleteCartao } = useContext(CartoesContext);

  const handleDelete = async (id) => {
    if (window.confirm('Tem certeza que deseja excluir este cartão?')) {
      try {
        await deleteCartao(id);
        toast.success('Cartão excluído com sucesso!');
      } catch (error) {
        toast.error('Erro ao excluir cartão');
      }
    }
  };

  const formatCurrency = (value) => {
    return parseFloat(value || 0).toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });
  };

  return (
    <div className="cardlist-container">
      <div className="cardlist-header">
        <h1>Cartões</h1>
        <button className="btn-add" onClick={() => navigate('/cartoes/novo')}>
          + Novo Cartão
        </button>
      </div>

      {cartoes.length === 0 ? (
        <div className="empty-state">
          <p>Nenhum cartão cadastrado</p>
          <button className="btn-add-empty" onClick={() => navigate('/cartoes/novo')}>
            Adicionar Primeiro Cartão
          </button>
        </div>
      ) : (
        <div className="cards-grid">
          {cartoes.map((cartao) => (
            <div
              key={cartao.id}
              className="card-item"
              style={{
                background: `linear-gradient(135deg, ${cartao.cor || cartao.color || '#667eea'}, ${adjustColor(cartao.cor || cartao.color || '#667eea', -30)})`,
              }}
            >
              <div className="card-emoji">{cartao.emoji || '💳'}</div>
              <div className="card-info">
                <h3>{cartao.nome}</h3>
                <p className="card-limit">
                  Limite: {formatCurrency(cartao.limite)}
                </p>
                {cartao.diaFechamento && (
                  <p className="card-closing">
                    Fechamento: dia {cartao.diaFechamento || cartao.dia_fechamento}
                  </p>
                )}
              </div>
              <div className="card-actions">
                <button
                  className="btn-edit-card"
                  onClick={() => navigate(`/cartoes/editar/${cartao.id}`)}
                >
                  ✏️
                </button>
                <button
                  className="btn-delete-card"
                  onClick={() => handleDelete(cartao.id)}
                >
                  🗑️
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Função para ajustar a cor (escurecer/clarear)
function adjustColor(color, amount) {
  const clamp = (val) => Math.min(Math.max(val, 0), 255);
  const num = parseInt(color.replace('#', ''), 16);
  const r = clamp((num >> 16) + amount);
  const g = clamp(((num >> 8) & 0x00ff) + amount);
  const b = clamp((num & 0x0000ff) + amount);
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
}
