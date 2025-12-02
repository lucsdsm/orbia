import { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import { ItensContext } from '../contexts/ItensContext';
import { CartoesContext } from '../contexts/CartoesContext';
import { toast } from 'react-toastify';
import './Settings.css';

export default function Settings() {
  const navigate = useNavigate();
  const { user, signOut } = useContext(AuthContext);
  const { itens, clearAllData: clearItens } = useContext(ItensContext);
  const { cartoes, clearAllData: clearCartoes } = useContext(CartoesContext);

  const [loading, setLoading] = useState(false);

  const handleExportData = () => {
    try {
      const dataToExport = {
        itens,
        cartoes,
        exportDate: new Date().toISOString(),
      };

      const jsonString = JSON.stringify(dataToExport, null, 2);
      const blob = new Blob([jsonString], { type: 'application/json' });
      const url = URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.href = url;
      link.download = `orbia-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      toast.success('Dados exportados com sucesso!');
    } catch (error) {
      console.error('Erro ao exportar dados:', error);
      toast.error('Erro ao exportar dados');
    }
  };

  const handleImportData = async () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';

    input.onchange = async (e) => {
      const file = e.target.files[0];
      if (!file) return;

      setLoading(true);

      try {
        const text = await file.text();
        const data = JSON.parse(text);

        if (data.itens && data.cartoes) {
          // Importar usando os contextos
          // Nota: Esta é uma implementação simplificada
          // Você pode precisar adicionar métodos específicos nos contextos
          toast.info('Importação de dados ainda não implementada totalmente');
          toast.info('Use a funcionalidade de importar no app mobile');
        } else {
          toast.error('Formato de arquivo inválido');
        }
      } catch (error) {
        console.error('Erro ao importar dados:', error);
        toast.error('Erro ao importar dados. Verifique o arquivo.');
      } finally {
        setLoading(false);
      }
    };

    input.click();
  };

  const handleClearAllData = async () => {
    if (
      window.confirm(
        'ATENÇÃO: Isso irá apagar TODOS os seus dados (itens e cartões) do Supabase e do armazenamento local. Esta ação não pode ser desfeita. Deseja continuar?'
      )
    ) {
      const confirmText = window.prompt(
        'Digite "CONFIRMAR" (em maiúsculas) para prosseguir:'
      );

      if (confirmText === 'CONFIRMAR') {
        setLoading(true);
        try {
          await clearItens();
          await clearCartoes();
          toast.success('Todos os dados foram apagados com sucesso!');
        } catch (error) {
          console.error('Erro ao limpar dados:', error);
          toast.error('Erro ao limpar dados');
        } finally {
          setLoading(false);
        }
      } else {
        toast.info('Operação cancelada');
      }
    }
  };

  const handleLogout = async () => {
    if (window.confirm('Deseja realmente sair?')) {
      await signOut();
      toast.success('Logout realizado com sucesso!');
      navigate('/login');
    }
  };

  return (
    <div className="settings-container">
      <div className="settings-header">
        <h1>Configurações</h1>
      </div>

      <div className="settings-section">
        <div className="section-header">
          <h2>👤 Conta</h2>
        </div>
        <div className="setting-card">
          <div className="setting-info">
            <h3>Email</h3>
            <p>{user?.email}</p>
          </div>
        </div>
        <div className="setting-card">
          <div className="setting-info">
            <h3>ID do Usuário</h3>
            <p className="user-id">{user?.id}</p>
          </div>
        </div>
      </div>

      <div className="settings-section">
        <div className="section-header">
          <h2>💾 Backup e Restauração</h2>
        </div>
        <div className="setting-card">
          <div className="setting-info">
            <h3>Exportar Dados</h3>
            <p>Baixe um backup de todos os seus itens e cartões em formato JSON</p>
          </div>
          <button
            className="btn-action btn-export"
            onClick={handleExportData}
            disabled={loading}
          >
            Exportar
          </button>
        </div>
        <div className="setting-card">
          <div className="setting-info">
            <h3>Importar Dados</h3>
            <p>
              Restaure seus dados a partir de um arquivo de backup (funcionalidade
              limitada)
            </p>
          </div>
          <button
            className="btn-action btn-import"
            onClick={handleImportData}
            disabled={loading}
          >
            Importar
          </button>
        </div>
      </div>

      <div className="settings-section">
        <div className="section-header">
          <h2>📊 Estatísticas</h2>
        </div>
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-value">{itens.length}</div>
            <div className="stat-label">Total de Itens</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">{cartoes.length}</div>
            <div className="stat-label">Total de Cartões</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">
              {itens.filter((i) => i.tipo === 'receita').length}
            </div>
            <div className="stat-label">Receitas</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">
              {itens.filter((i) => i.tipo === 'despesa').length}
            </div>
            <div className="stat-label">Despesas</div>
          </div>
        </div>
      </div>

      <div className="settings-section danger-section">
        <div className="section-header">
          <h2>⚠️ Zona de Perigo</h2>
        </div>
        <div className="setting-card danger-card">
          <div className="setting-info">
            <h3>Limpar Todos os Dados</h3>
            <p>
              Remove permanentemente todos os itens e cartões do banco de dados e
              armazenamento local
            </p>
          </div>
          <button
            className="btn-action btn-danger"
            onClick={handleClearAllData}
            disabled={loading}
          >
            Limpar Tudo
          </button>
        </div>
        <div className="setting-card">
          <div className="setting-info">
            <h3>Sair da Conta</h3>
            <p>Desconectar desta conta e retornar à tela de login</p>
          </div>
          <button
            className="btn-action btn-logout"
            onClick={handleLogout}
            disabled={loading}
          >
            Sair
          </button>
        </div>
      </div>

      <div className="settings-footer">
        <p>Orbia Desktop v1.0.0</p>
        <p>Sincronizado com Supabase</p>
      </div>
    </div>
  );
}
