"use client";

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { fetchUserQualifications, requestNewQualification, Qualification } from '@/services/userDataService';
import { showError, showSuccess } from '@/utils/toast';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2 } from 'lucide-react';

const MyQualifications = () => {
  const { user } = useAuth();
  const [qualifications, setQualifications] = useState<Qualification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Estados para a funcionalidade de solicitação de nova habilitação
  const [isRequestingQualification, setIsRequestingQualification] = useState(false);
  const [selectedQualificationType, setSelectedQualificationType] = useState('');
  const [requestingLoading, setRequestingLoading] = useState(false);

  const getQualifications = async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }
    try {
      const userQualifications = await fetchUserQualifications(user.id);
      setQualifications(userQualifications);
    } catch (err) {
      setError("Não foi possível carregar suas habilitações.");
      showError("Não foi possível carregar suas habilitações.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getQualifications();
  }, [user]);

  const handleRequestQualification = async () => {
    if (!user?.id || !selectedQualificationType) {
      showError("Por favor, selecione um tipo de habilitação.");
      return;
    }

    setRequestingLoading(true);
    try {
      await requestNewQualification(user.id, selectedQualificationType);
      showSuccess("Solicitação de habilitação enviada com sucesso! Ela está aguardando aprovação.");
      setIsRequestingQualification(false);
      setSelectedQualificationType('');
      getQualifications(); // Recarrega a lista de habilitações
    } catch (err: any) {
      showError(`Erro ao solicitar habilitação: ${err.message || 'Erro desconhecido'}`);
      console.error(err);
    } finally {
      setRequestingLoading(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Minhas Habilitações</CardTitle>
          <CardDescription>
            Gerencie suas habilitações para participar de diferentes tipos de leilões.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-center text-muted-foreground">Carregando habilitações...</p>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Minhas Habilitações</CardTitle>
          <CardDescription>
            Gerencie suas habilitações para participar de diferentes tipos de leilões.
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
        <CardTitle>Minhas Habilitações</CardTitle>
        <CardDescription>
          Gerencie suas habilitações para participar de diferentes tipos de leilões.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {qualifications.length > 0 ? (
          <div className="grid gap-4">
            {qualifications.map((qual) => (
              <div key={qual.id} className="flex items-center justify-between p-4 border rounded-md">
                <div>
                  <p className="font-medium">{qual.type}</p>
                  <p className="text-sm text-muted-foreground">
                    Expira em: {qual.expires_at ? new Date(qual.expires_at).toLocaleDateString('pt-BR') : 'N/A'}
                  </p>
                </div>
                <Badge variant={qual.status === 'Aprovado' ? 'default' : 'secondary'}>
                  {qual.status}
                </Badge>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-muted-foreground">Você não possui habilitações cadastradas.</p>
        )}
        <Button className="mt-4" onClick={() => setIsRequestingQualification(true)}>Solicitar Nova Habilitação</Button>
      </CardContent>

      {/* Diálogo de Solicitação de Habilitação */}
      <Dialog open={isRequestingQualification} onOpenChange={setIsRequestingQualification}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Solicitar Nova Habilitação</DialogTitle>
            <DialogDescription>
              Selecione o tipo de habilitação que deseja solicitar.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="qualification-type">Tipo de Habilitação</Label>
              <Select onValueChange={setSelectedQualificationType} value={selectedQualificationType} disabled={requestingLoading}>
                <SelectTrigger id="qualification-type" className="w-full">
                  <SelectValue placeholder="Selecione um tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Geral">Habilitação Geral</SelectItem>
                  <SelectItem value="Veículos Pesados">Veículos Pesados</SelectItem>
                  <SelectItem value="Máquinas Agrícolas">Máquinas Agrícolas</SelectItem>
                  <SelectItem value="Imóveis">Imóveis</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRequestingQualification(false)} disabled={requestingLoading}>
              Cancelar
            </Button>
            <Button onClick={handleRequestQualification} disabled={requestingLoading || !selectedQualificationType}>
              {requestingLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Solicitando...
                </>
              ) : (
                "Enviar Solicitação"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default MyQualifications;