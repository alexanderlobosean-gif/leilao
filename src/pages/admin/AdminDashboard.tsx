"use client";

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const AdminDashboard = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold text-gray-800">Painel Administrativo</h1>
      <p className="text-muted-foreground">Visão geral e estatísticas do sistema.</p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Total de Lotes</CardTitle>
            <CardDescription>Lotes ativos e finalizados.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">120</p> {/* Placeholder */}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Usuários Registrados</CardTitle>
            <CardDescription>Total de usuários na plataforma.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">540</p> {/* Placeholder */}
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Lances Hoje</CardTitle>
            <CardDescription>Número de lances realizados hoje.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-4xl font-bold">35</p> {/* Placeholder */}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Atividade Recente</CardTitle>
          <CardDescription>Últimas ações no sistema.</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm text-gray-700">
            <li>[HH:MM] Usuário X fez um lance no Lote Y.</li>
            <li>[HH:MM] Novo documento enviado por Usuário Z.</li>
            <li>[HH:MM] Lote A foi finalizado.</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};

export default AdminDashboard;