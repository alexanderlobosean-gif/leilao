"use client";

import React from 'react';
import { Outlet } from 'react-router-dom';
import AdminSidebar from '@/components/admin/AdminSidebar'; // Usando alias @/
import Header from '@/components/Header'; // Reutilizando o Header existente
import Footer from '@/components/Footer'; // Reutilizando o Footer existente

const AdminLayout = () => {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50 text-gray-800">
      <Header /> {/* Opcional: pode-se criar um Header específico para admin */}
      <div className="flex flex-1">
        <AdminSidebar />
        <main className="flex-1 p-6 lg:p-8">
          <Outlet /> {/* As páginas administrativas serão renderizadas aqui */}
        </main>
      </div>
      <Footer /> {/* Opcional: pode-se criar um Footer específico para admin */}
    </div>
  );
};

export default AdminLayout;