"use client";

import React from 'react';
import { useAuth } from '@/context/AuthContext';
import { Navigate, Outlet, useLocation } from 'react-router-dom';

const ProtectedRoute = () => {
  const { user, loading } = useAuth();
  const location = useLocation(); // Obtém a localização atual

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 text-gray-800">
        Carregando...
      </div>
    );
  }

  // Define as rotas públicas que não requerem autenticação
  const publicRoutes = ['/', '/lot/', '/about', '/contact', '/login', '/register', '/leiloes'];
  const isPublicRoute = publicRoutes.some(route => location.pathname === route || location.pathname.startsWith(route + '/'));

  // Se a rota for pública, permite o acesso independente de estar logado
  if (isPublicRoute) {
    return <Outlet />;
  }

  // Se não estiver logado e a rota não for pública, redireciona para o login
  if (!user) {
    // Salva a rota atual para redirecionar após o login
    return <Navigate to={`/login?redirectTo=${encodeURIComponent(location.pathname)}`} replace />;
  }

  // Se estiver logado, verifica o acesso de administrador para rotas /admin
  if (location.pathname.startsWith('/admin')) {
    const userType = user.user_metadata?.user_type;
    if (userType !== 'admin') {
      // Não é um administrador, redireciona para a página inicial
      return <Navigate to="/" replace />;
    }
  }

  // Se estiver logado e (não for uma rota admin OU for uma rota admin e o usuário for admin), permite o acesso
  return <Outlet />;
};

export default ProtectedRoute;