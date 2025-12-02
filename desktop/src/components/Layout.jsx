import React from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Home, FileText, CreditCard, BarChart3, Settings, LogOut } from 'lucide-react';
import './Layout.css';

export default function Layout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut } = useAuth();

  const menuItems = [
    { path: '/', label: 'Início', icon: Home },
    { path: '/itens', label: 'Itens', icon: FileText },
    { path: '/cartoes', label: 'Cartões', icon: CreditCard },
    { path: '/graficos', label: 'Gráficos', icon: BarChart3 },
    { path: '/configuracoes', label: 'Configurações', icon: Settings },
  ];

  const handleLogout = async () => {
    if (window.confirm('Deseja realmente sair?')) {
      await signOut();
      navigate('/login');
    }
  };

  return (
    <div className="layout">
      <header className="header">
        <div className="header-content">
          <div className="logo">
            <span className="logo-icon">💰</span>
            <span className="logo-text">Orbia</span>
          </div>

          <nav className="header-nav">
            {menuItems.map(item => {
              const Icon = item.icon;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
                  title={item.label}
                >
                  <Icon size={20} />
                  <span className="nav-label">{item.label}</span>
                </Link>
              );
            })}
          </nav>

          <button className="logout-btn" onClick={handleLogout} title="Sair">
            <LogOut size={20} />
          </button>
        </div>
      </header>

      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}
