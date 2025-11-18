"use client";

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useAuth } from '@/context/AuthContext';
import { fetchUserBids, Bid } from '@/services/userDataService';
import { showError } from '@/utils/toast';

const MyBids = () => {
  const { user } = useAuth();
  const [bids, setBids] = useState<Bid[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const getBids = async () => {
      if (!user?.id) {
        setLoading(false);
        return;
      }
      try {
        const userBids = await fetchUserBids(user.id);
        setBids(userBids);
      } catch (err) {
        setError("Não foi possível carregar seus lances.");
        showError("Não foi possível carregar seus lances.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    getBids();
  }, [user]);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Meus Lances</CardTitle>
          <CardDescription>
            Visualize o histórico dos seus lances em leilões.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground">Carregando lances...</p>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Meus Lances</CardTitle>
          <CardDescription>
            Visualize o histórico dos seus lances em leilões.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-center text-red-500">{error}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Meus Lances</CardTitle>
        <CardDescription>
          Visualize o histórico dos seus lances em leilões.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {bids.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Lote</TableHead>
                <TableHead>Valor do Lance</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Data</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {bids.map((bid) => (
                <TableRow key={bid.id}>
                  <TableCell className="font-medium">{bid.lot_title || 'N/A'}</TableCell>
                  <TableCell>R$ {bid.bid_amount.toLocaleString('pt-BR')}</TableCell>
                  <TableCell>{bid.status}</TableCell>
                  <TableCell>{new Date(bid.created_at).toLocaleString('pt-BR')}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <p className="text-center text-muted-foreground">Você ainda não fez nenhum lance.</p>
        )}
      </CardContent>
    </Card>
  );
};

export default MyBids;