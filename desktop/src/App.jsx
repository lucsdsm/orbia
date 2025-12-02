import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ItensProvider } from './contexts/ItensContext';
import { CartoesProvider } from './contexts/CartoesContext';
import { SaldoProvider } from './contexts/SaldoContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Home from './pages/Home';
import ItemList from './pages/ItemList';
import ItemAdd from './pages/ItemAdd';
import ItemEdit from './pages/ItemEdit';
import CardList from './pages/CardList';
import CardAdd from './pages/CardAdd';
import CardEdit from './pages/CardEdit';
import Charts from './pages/Charts';
import Settings from './pages/Settings';
import './App.css';

function PrivateRoute({ children }) {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <div className="loading">Carregando...</div>;
  }
  
  return user ? children : <Navigate to="/login" />;
}

function PublicRoute({ children }) {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <div className="loading">Carregando...</div>;
  }
  
  return user ? <Navigate to="/" /> : children;
}

function App() {
  return (
    <AuthProvider>
      <SaldoProvider>
        <ItensProvider>
          <CartoesProvider>
            <BrowserRouter>
            <Routes>
              <Route path="/login" element={
                <PublicRoute>
                  <Login />
                </PublicRoute>
              } />
              
              <Route path="/" element={
                <PrivateRoute>
                  <Layout />
                </PrivateRoute>
              }>
                <Route index element={<Home />} />
                <Route path="itens" element={<ItemList />} />
                <Route path="itens/novo" element={<ItemAdd />} />
                <Route path="itens/editar/:id" element={<ItemEdit />} />
                <Route path="cartoes" element={<CardList />} />
                <Route path="cartoes/novo" element={<CardAdd />} />
                <Route path="cartoes/editar/:id" element={<CardEdit />} />
                <Route path="graficos" element={<Charts />} />
                <Route path="configuracoes" element={<Settings />} />
              </Route>
            </Routes>
            <ToastContainer position="top-right" autoClose={3000} />
            </BrowserRouter>
          </CartoesProvider>
        </ItensProvider>
      </SaldoProvider>
    </AuthProvider>
  );
}

export default App;
