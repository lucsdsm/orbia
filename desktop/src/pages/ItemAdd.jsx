import { useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ItensContext } from '../contexts/ItensContext';
import { CartoesContext } from '../contexts/CartoesContext';
import { toast } from 'react-toastify';
import './ItemForm.css';

export default function ItemAdd() {
  const navigate = useNavigate();
  const { addItem } = useContext(ItensContext);
  const { cartoes } = useContext(CartoesContext);

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    nome: '',
    tipo: 'despesa',
    valor: '',
    data: new Date().toISOString().split('T')[0],
    emoji: '💰',
    emojiPersonalizado: '',
    cartaoId: '',
    numParcelas: 1,
    mesPrimeiraParcela: new Date().getMonth(),
  });

  const emojis = [
    '💰',
    '🏠',
    '🚗',
    '🍔',
    '🎮',
    '📱',
    '💊',
    '✈️',
    '🎓',
    '🛒',
    '💳',
    '🎉',
    '🎁',
    '📚',
    '⚡',
  ];

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

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.nome.trim()) {
      toast.error('Nome é obrigatório');
      return;
    }

    if (!formData.valor || parseFloat(formData.valor) <= 0) {
      toast.error('Valor deve ser maior que zero');
      return;
    }

    setLoading(true);

    try {
      await addItem({
        nome: formData.nome,
        descricao: formData.nome,
        tipo: formData.tipo,
        valor: parseFloat(formData.valor),
        data: formData.data,
        emoji: formData.emoji,
        categoria: formData.emoji,
        cartaoId: formData.cartaoId || null,
        numParcelas: parseInt(formData.numParcelas) || 1,
        mesPrimeiraParcela: parseInt(formData.mesPrimeiraParcela),
        mes_primeira_parcela: parseInt(formData.mesPrimeiraParcela),
      });

      toast.success('Item adicionado com sucesso!');
      navigate('/itens');
    } catch (error) {
      console.error('Erro ao adicionar item:', error);
      toast.error('Erro ao adicionar item');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="itemform-container">
      <div className="itemform-header">
        <h1>Novo Item</h1>
        <button className="btn-back" onClick={() => navigate('/itens')}>
          ← Voltar
        </button>
      </div>

      <form className="itemform" onSubmit={handleSubmit}>
        <div className="form-row">
          <div className="form-group">
            <label>Nome *</label>
            <input
              type="text"
              value={formData.nome}
              onChange={(e) => handleChange('nome', e.target.value)}
              placeholder="Ex: Salário, Aluguel..."
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label>Tipo *</label>
            <select
              value={formData.tipo}
              onChange={(e) => handleChange('tipo', e.target.value)}
              disabled={loading}
            >
              <option value="receita">Receita</option>
              <option value="despesa">Despesa</option>
            </select>
          </div>
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Valor (R$) *</label>
            <input
              type="number"
              step="0.01"
              value={formData.valor}
              onChange={(e) => handleChange('valor', e.target.value)}
              placeholder="0.00"
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label>Data *</label>
            <input
              type="date"
              value={formData.data}
              onChange={(e) => handleChange('data', e.target.value)}
              disabled={loading}
            />
          </div>
        </div>

        <div className="form-group">
          <label>Emoji</label>
          <div className="emoji-grid">
            {emojis.map((emoji) => (
              <button
                key={emoji}
                type="button"
                className={`emoji-btn ${formData.emoji === emoji && !formData.emojiPersonalizado ? 'selected' : ''}`}
                onClick={() => {
                  handleChange('emoji', emoji);
                  handleChange('emojiPersonalizado', '');
                }}
                disabled={loading}
              >
                {emoji}
              </button>
            ))}
          </div>
          <input
            type="text"
            value={formData.emojiPersonalizado}
            onChange={(e) => {
              handleChange('emojiPersonalizado', e.target.value);
              if (e.target.value) {
                handleChange('emoji', e.target.value);
              }
            }}
            placeholder="Ou digite seu emoji personalizado"
            disabled={loading}
            maxLength="2"
            style={{ marginTop: '1rem' }}
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label>Cartão (opcional)</label>
            <select
              value={formData.cartaoId}
              onChange={(e) => handleChange('cartaoId', e.target.value)}
              disabled={loading}
            >
              <option value="">Nenhum</option>
              {cartoes.map((cartao) => (
                <option key={cartao.id} value={cartao.id}>
                  {cartao.nome}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Número de Parcelas</label>
            <input
              type="number"
              min="1"
              value={formData.numParcelas}
              onChange={(e) => handleChange('numParcelas', e.target.value)}
              disabled={loading}
            />
          </div>
        </div>

        {formData.numParcelas > 1 && (
          <div className="form-group">
            <label>Mês da Primeira Parcela</label>
            <select
              value={formData.mesPrimeiraParcela}
              onChange={(e) =>
                handleChange('mesPrimeiraParcela', e.target.value)
              }
              disabled={loading}
            >
              {meses.map((mes, index) => (
                <option key={index} value={index}>
                  {mes}
                </option>
              ))}
            </select>
          </div>
        )}

        <div className="form-actions">
          <button
            type="button"
            className="btn-cancel"
            onClick={() => navigate('/itens')}
            disabled={loading}
          >
            Cancelar
          </button>
          <button type="submit" className="btn-submit" disabled={loading}>
            {loading ? 'Salvando...' : 'Salvar Item'}
          </button>
        </div>
      </form>
    </div>
  );
}
