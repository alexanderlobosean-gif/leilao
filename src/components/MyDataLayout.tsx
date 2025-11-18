"use client";

import React from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import Header from '@/components/Header';
import Footer from '@/components/Footer'; // Importando o novo componente Footer
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';

const sidebarNavItems = [
  {
    title: "Meu Cadastro",
    href: "/my-data/registration",
  },
  {
    title: "Meus Lances",
    href: "/my-data/bids",
  },
  {
    title: "Minhas Habilitações",
    href: "/my-data/qualifications",
  },
  {
    title: "Documentos",
    href: "/my-data/documents",
  },
];

const MyDataLayout = () => {
  const location = useLocation();

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 flex flex-col">
      <Header />
      <div className="flex-grow max-w-7xl mx-auto p-6 w-full">
        <div className="space-y-0.5">
          <h2 className="text-2xl font-bold tracking-tight">Meus Dados</h2>
          <p className="text-muted-foreground">
            Gerencie suas informações de perfil, lances e documentos.
          </p>
        </div>
        <Separator className="my-6" />
        <div className="flex flex-col space-y-8 lg:flex-row lg:space-x-12 lg:space-y-0">
          <aside className="-mx-4 lg:w-1/5">
            <nav className="flex space-x-2 lg:flex-col lg:space-x-0 lg:space-y-1">
              {sidebarNavItems.map((item) => (
                <Link
                  key={item.href}
                  to={item.href}
                  className={cn(
                    "flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors hover:bg-gray-100",
                    location.pathname === item.href
                      ? "bg-muted hover:bg-muted text-primary"
                      : "text-muted-foreground hover:text-primary"
                  )}
                >
                  {item.title}
                </Link>
              ))}
            </nav>
          </aside>
          <div className="flex-1 lg:max-w-2xl">
            <Outlet /> {/* Aqui as sub-páginas serão renderizadas */}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default MyDataLayout;