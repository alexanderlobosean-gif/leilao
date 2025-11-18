"use client";

import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { LayoutDashboard, Gavel, Users, FileText } from 'lucide-react';

const adminNavItems = [
  {
    title: "Dashboard",
    href: "/admin/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Gerenciar Lotes",
    href: "/admin/lots",
    icon: Gavel,
  },
  {
    title: "Gerenciar Usuários",
    href: "/admin/users",
    icon: Users,
  },
  {
    title: "Gerenciar Documentos",
    href: "/admin/documents",
    icon: FileText,
  },
];

const AdminSidebar = () => {
  const location = useLocation();

  return (
    <aside className="w-64 bg-sidebar text-sidebar-foreground p-4 flex flex-col h-full">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-sidebar-primary-foreground">Admin Panel</h2>
      </div>
      <nav className="flex-1 space-y-1">
        {adminNavItems.map((item) => (
          <Link
            key={item.href}
            to={item.href}
            className={cn(
              "flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors",
              location.pathname.startsWith(item.href)
                ? "bg-sidebar-accent text-sidebar-accent-foreground"
                : "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
            )}
          >
            <item.icon className="h-5 w-5" />
            {item.title}
          </Link>
        ))}
      </nav>
    </aside>
  );
};

export default AdminSidebar;