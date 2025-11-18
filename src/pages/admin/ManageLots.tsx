"use client";

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { PlusCircle, Edit, Trash2, Loader2 } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { fetchAllLots, createLot, updateLot, deleteLot, Lot } from '@/services/lotService';
import { showSuccess, showError } from '@/utils/toast';
import LotForm from '@/components/admin/LotForm'; // Importando o novo componente de formulário
import { supabase } from '@/lib/supabaseClient';

const ManageLots = () => {
  const [lots, setLots] = useState<Lot[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingLot, setEditingLot] = useState<Lot | null>(null);
  const [deletingLotId, setDeletingLotId] = useState<string | null>(null);
  const [categories, setCategories] = useState<{ id: string; slug: string; name: string }[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('todas');
  const [filterStatus, setFilterStatus] = useState<string>('todos');

  const getLots = async () => {
    setLoading(true);
    try {
      const [fetchedLots, fetchedCategories] = await Promise.all([
        fetchAllLots(),
        (async () => {
          const { data, error } = await supabase
            .from('categories')
            .select('id, slug, name')
            .order('name', { ascending: true });

          if (error) {
            console.error('Erro ao carregar categorias:', error);
            showError('Não foi possível carregar as categorias.');
            return [] as { id: string; slug: string; name: string }[];
          }

          return (data || []) as { id: string; slug: string; name: string }[];
        })(),
      ]);

      setLots(fetchedLots);
      setCategories(fetchedCategories);
    } catch (err) {
      showError("Não foi possível carregar os lotes.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredLots = lots.filter((lot) => {
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      !term ||
      lot.title.toLowerCase().includes(term) ||
      (lot.short_description || '').toLowerCase().includes(term);

    const categoryName = ((lot as any).category_name || (lot as any).category || '').toLowerCase();
    const matchesCategory =
      filterCategory === 'todas' ||
      categoryName === filterCategory.toLowerCase();

    const matchesStatus =
      filterStatus === 'todos' || lot.status.toLowerCase() === filterStatus.toLowerCase();

    return matchesSearch && matchesCategory && matchesStatus;
  });

  useEffect(() => {
    getLots();
  }, []);

  const handleAddLot = () => {
    setEditingLot(null);
    setIsFormOpen(true);
  };

  const handleEditLot = (lot: Lot) => {
    setEditingLot(lot);
    setIsFormOpen(true);
  };

  const handleDeleteLot = async () => {
    if (!deletingLotId) return;

    setIsSubmitting(true);
    try {
      await deleteLot(deletingLotId);
      showSuccess("Lote excluído com sucesso!");
      getLots(); // Recarrega a lista
      setDeletingLotId(null);
    } catch (err: any) {
      showError(`Erro ao excluir lote: ${err.message || 'Erro desconhecido'}`);
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFormSubmit = async (data: any) => {
    setIsSubmitting(true);
    try {
      // Converter a data para o formato ISO string esperado pelo Supabase
      const formattedData = {
        ...data,
        ends_at: data.ends_at.toISOString(),
      };

      if (editingLot) {
        await updateLot(editingLot.id, formattedData);
        showSuccess("Lote atualizado com sucesso!");
      } else {
        await createLot(formattedData);
        showSuccess("Lote adicionado com sucesso!");
      }
      setIsFormOpen(false);
      getLots(); // Recarrega a lista
    } catch (err: any) {
      showError(`Erro ao salvar lote: ${err.message || 'Erro desconhecido'}`);
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-800">Gerenciar Lotes</h1>
        <p className="text-muted-foreground">Carregando lotes...</p>
        <Loader2 className="h-8 w-8 animate-spin text-indigo-600 mx-auto mt-10" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-800">Gerenciar Lotes</h1>
        <Button onClick={handleAddLot}>
          <PlusCircle className="h-4 w-4 mr-2" /> Adicionar Novo Lote
        </Button>
      </div>
      <p className="text-muted-foreground">Visualize, edite e crie lotes para leilão.</p>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Lotes</CardTitle>
          <CardDescription>Todos os lotes disponíveis e seus status.</CardDescription>
        </CardHeader>
        <CardContent>
          {/* Filtros */}
          <div className="mb-4 grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Buscar</label>
              <input
                type="text"
                placeholder="Buscar por título ou descrição"
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Categoria</label>
              <select
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
              >
                <option value="todas">Todas</option>
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.name.toLowerCase()}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Status</label>
              <select
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
              >
                <option value="todos">Todos</option>
                <option value="aberto">Aberto</option>
                <option value="encerrado">Encerrado</option>
              </select>
            </div>
          </div>

          {filteredLots.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Título</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Lance Atual</TableHead>
                  <TableHead>Encerra em</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLots.map((lot) => (
                  <TableRow key={lot.id}>
                    <TableCell className="font-medium">{lot.title}</TableCell>
                    <TableCell>{(lot as any).category_name || (lot as any).category || '-'}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${lot.status === 'aberto' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-700'}`}>
                        {lot.status.toUpperCase()}
                      </span>
                    </TableCell>
                    <TableCell>R$ {lot.current_bid.toLocaleString('pt-BR')}</TableCell>
                    <TableCell>{new Date(lot.ends_at).toLocaleString('pt-BR')}</TableCell>
                    <TableCell className="text-right flex justify-end gap-2">
                      <Button variant="ghost" size="sm" onClick={() => handleEditLot(lot)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-800" onClick={() => setDeletingLotId(lot.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Tem certeza?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Esta ação não pode ser desfeita. Isso excluirá permanentemente o lote
                              <span className="font-bold"> {lot.title}</span> e removerá seus dados de nossos servidores.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel disabled={isSubmitting}>Cancelar</AlertDialogCancel>
                            <AlertDialogAction onClick={handleDeleteLot} disabled={isSubmitting}>
                              {isSubmitting ? (
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                              ) : (
                                "Excluir"
                              )}
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-center text-muted-foreground py-4">Nenhum lote cadastrado ainda.</p>
          )}
        </CardContent>
      </Card>

      {/* Diálogo para Adicionar/Editar Lote */}
      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{editingLot ? "Editar Lote" : "Adicionar Novo Lote"}</DialogTitle>
            <DialogDescription>
              {editingLot ? "Edite os detalhes do lote selecionado." : "Preencha os detalhes para criar um novo lote."}
            </DialogDescription>
          </DialogHeader>
          <LotForm
            initialData={editingLot || undefined}
            onSubmit={handleFormSubmit}
            onCancel={() => setIsFormOpen(false)}
            isLoading={isSubmitting}
            categories={categories}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ManageLots;