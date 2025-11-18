"use client";

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { fetchLotBids, BidHistoryEntry } from '@/services/lotService';
import { showError } from '@/utils/toast';
import { Loader2 } from 'lucide-react';

interface BidHistoryProps {
  lotId: string;
}

const BidHistory: React.FC<BidHistoryProps> = ({ lotId }) => {
  const [bids, setBids] = useState<BidHistoryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const getBidHistory = async () => {
      try {
        const fetchedBids = await fetchLotBids(lotId);
        setBids(fetchedBids);
      } catch (err) {
        setError("Não foi possível carregar o histórico de lances.");
        showError("Não foi possível carregar o histórico de lances.");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    getBidHistory();
  }, [lotId]);

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Histórico de Lances</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-center p-6">
          <Loader2 className="h-6 w-6 animate-spin text-indigo-600" />
          <p className="ml-2 text-muted-foreground">Carregando histórico de lances...</p>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Histórico de Lances</CardTitle>
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
        <CardTitle>Histórico de Lances</CardTitle>
      </CardHeader>
      <CardContent>
        {bids.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Lance</TableHead>
                <TableHead>Data/Hora</TableHead>
                {/* <TableHead>Usuário</TableHead> */} {/* Opcional: se quiser mostrar um ID anonimizado */}
              </TableRow>
            </TableHeader>
            <TableBody>
              {bids.map((bid) => (
                <TableRow key={bid.id}>
                  <TableCell className="font-medium">R$ {bid.bid_amount.toLocaleString('pt-BR')}</TableCell>
                  <TableCell>{new Date(bid.created_at).toLocaleString('pt-BR')}</TableCell>
                  {/* <TableCell>{bid.user_id.substring(0, 8)}...</TableCell> */}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <p className="text-center text-muted-foreground">Nenhum lance registrado para este lote ainda.</p>
        )}
      </CardContent>
    </Card>
  );
};

export default BidHistory;