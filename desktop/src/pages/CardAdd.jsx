import { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CartoesContext } from '../contexts/CartoesContext';
import { toast } from 'react-toastify';
import './CardForm.css';

export default function CardAdd() {
  const navigate = useNavigate();
  const { addCartao } = useContext(CartoesContext);

  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    nome: '',
    limite: '',
    cor: '#667eea',
    emoji: '💳',
    diaFechamento: 1,
  });

  const emojis = ['💳', '💰', '🏦', '💵', '💴', '💶', '💷', '🪙', '💸'];

  const cores = [
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
    '#a8edea',
    '#fed6e3',
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

    if (!formData.limite || parseFloat(formData.limite) <= 0) {
      toast.error('Limite deve ser maior que zero');
      return;
    }

    setLoading(true);

    try {
      await addCartao({
        nome: formData.nome,
        limite: parseFloat(formData.limite),
        cor: formData.cor,
        color: formData.cor,
        emoji: formData.emoji,
        diaFechamento: parseInt(formData.diaFechamento),
        dia_fechamento: parseInt(formData.diaFechamento),
      });

      toast.success('Cartão adicionado com sucesso!');
      navigate('/cartoes');
    } catch (error) {
      console.error('Erro ao adicionar cartão:', error);
      toast.error('Erro ao adicionar cartão');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="cardform-container">
      <div className="cardform-header">
        <h1>Novo Cartão</h1>
        <button className="btn-back" onClick={() => navigate('/cartoes')}>
          ← Voltar
        </button>
      </div>

      <form className="cardform" onSubmit={handleSubmit}>
        <div className="form-row">
          <div className="form-group">
            <label>Nome do Cartão *</label>
            <input
              type="text"
              value={formData.nome}
              onChange={(e) => handleChange('nome', e.target.value)}
              placeholder="Ex: Nubank, Itaú..."
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label>Limite (R$) *</label>
            <input
              type="number"
              step="0.01"
              value={formData.limite}
              onChange={(e) => handleChange('limite', e.target.value)}
              placeholder="0.00"
              disabled={loading}
            />
          </div>
        </div>

        <div className="form-group">
          <label>Dia de Fechamento</label>
          <input
            type="number"
            min="1"
            max="31"
            value={formData.diaFechamento}
            onChange={(e) => handleChange('diaFechamento', e.target.value)}
            disabled={loading}
          />
        </div>

        <div className="form-group">
          <label>Emoji</label>
          <div className="emoji-grid">
            {emojis.map((emoji) => (
              <button
                key={emoji}
                type="button"
                className={`emoji-btn ${formData.emoji === emoji ? 'selected' : ''}`}
                onClick={() => handleChange('emoji', emoji)}
                disabled={loading}
              >
                {emoji}
              </button>
            ))}
          </div>
        </div>

        <div className="form-group">
          <label>Cor do Cartão</label>
          <div className="color-grid">
            {cores.map((cor) => (
              <button
                key={cor}
                type="button"
                className={`color-btn ${formData.cor === cor ? 'selected' : ''}`}
                style={{ background: cor }}
                onClick={() => handleChange('cor', cor)}
                disabled={loading}
              />
            ))}
          </div>
        </div>

        <div className="card-preview" style={{ background: formData.cor }}>
          <div className="preview-emoji">{formData.emoji}</div>
          <div className="preview-info">
            <h3>{formData.nome || 'Nome do Cartão'}</h3>
            <p>
              Limite:{' '}
              {formData.limite
                ? parseFloat(formData.limite).toLocaleString('pt-BR', {
                    style: 'currency',
                    currency: 'BRL',
                  })
                : 'R$ 0,00'}
            </p>
            {formData.diaFechamento && (
              <p>Fechamento: dia {formData.diaFechamento}</p>
            )}
          </div>
        </div>

        <div className="form-actions">
          <button
            type="button"
            className="btn-cancel"
            onClick={() => navigate('/cartoes')}
            disabled={loading}
          >
            Cancelar
          </button>
          <button type="submit" className="btn-submit" disabled={loading}>
            {loading ? 'Salvando...' : 'Salvar Cartão'}
          </button>
        </div>
      </form>
    </div>
  );
}
