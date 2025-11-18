"use client";

import { useEffect, useState, useCallback, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, FileText, Clock, CheckCircle, XCircle, ExternalLink, Filter, ChevronLeft, ChevronRight, Calendar } from 'lucide-react';
import { format, subDays, isAfter, isBefore } from 'date-fns';
import { DateRange } from 'react-day-picker';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { debounce } from 'lodash';
import { supabase } from '@/lib/supabase';
import { showSuccess, showError } from '@/utils/toast';
import type { Document, DocumentUpdate, User } from '@/types/database.types';

type DocumentStatus = 'Pendente' | 'Aprovado' | 'Rejeitado';

interface DocumentWithUser extends Omit<Document, 'status' | 'rejection_reason'> {
  status: DocumentStatus;
  rejection_reason: string | null;
  user?: User & {
    raw_user_meta_data?: {
      name?: string;
    };
  };
}

const ITEMS_PER_PAGE = 10;

const ManageDocuments = () => {
  const [documents, setDocuments] = useState<DocumentWithUser[]>([]);
  const [filteredDocuments, setFilteredDocuments] = useState<DocumentWithUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [rejectingDoc, setRejectingDoc] = useState<string | null>(null);
  
  // Filtros
  const [filters, setFilters] = useState({
    status: 'all' as 'all' | DocumentStatus,
    dateRange: {
      from: subDays(new Date(), 30),
      to: new Date(),
    } as DateRange | undefined,
  });
  
  // Paginação
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
  });

  // Aplicar filtros
  const applyFilters = useCallback((docs: DocumentWithUser[], search: string, status: string, dateRange?: DateRange) => {
    return docs.filter(doc => {
      // Filtro por termo de busca
      const searchLower = search.toLowerCase();
      const matchesSearch = search === '' || 
        doc.name.toLowerCase().includes(searchLower) ||
        doc.user?.email?.toLowerCase().includes(searchLower) ||
        (typeof doc.user?.raw_user_meta_data === 'object' && 
         doc.user.raw_user_meta_data && 
         'name' in doc.user.raw_user_meta_data && 
         typeof doc.user.raw_user_meta_data.name === 'string' &&
         doc.user.raw_user_meta_data.name.toLowerCase().includes(searchLower));
      
      // Filtro por status
      const matchesStatus = status === 'all' || doc.status === status;
      
      // Filtro por data
      let matchesDate = true;
      if (dateRange?.from && dateRange?.to) {
        const docDate = new Date(doc.uploaded_at);
        matchesDate = isAfter(docDate, dateRange.from) && isBefore(docDate, dateRange.to);
      }
      
      return matchesSearch && matchesStatus && matchesDate;
    });
  }, []);

  // Atualizar documentos filtrados quando os filtros mudarem
  useEffect(() => {
    const filtered = applyFilters(documents, searchTerm, filters.status, filters.dateRange);
    setFilteredDocuments(filtered);
    
    // Atualizar paginação
    const totalPages = Math.ceil(filtered.length / ITEMS_PER_PAGE);
    setPagination(prev => ({
      ...prev,
      totalPages,
      totalItems: filtered.length,
      currentPage: prev.currentPage > totalPages ? 1 : prev.currentPage
    }));
  }, [documents, searchTerm, filters, applyFilters]);

  // Buscar documentos (apenas garante que está autenticado; autorização fica a cargo do ProtectedRoute/RLS)
  const fetchDocuments = useCallback(async () => {
    try {
      setLoading(true);

      const { data: { user: currentUser } } = await supabase.auth.getUser();
      if (!currentUser) {
        throw new Error('Usuário não autenticado');
      }

      // Busca os documentos com os dados dos usuários/perfis
      const { data, error } = await supabase
        .from('documents')
        .select(`
          *,
          profiles (
            id,
            email,
            user_type,
            raw_user_meta_data
          )
        `)
        .order('uploaded_at', { ascending: false });

      if (error) throw error;
      
      // Formata os documentos
      const formattedDocuments = (data || []).map(doc => ({
        ...doc,
        user: (doc as any).profiles as User,
        profiles: undefined,
      }));
      
      setDocuments(formattedDocuments);
    } catch (error: any) {
      console.error('Error fetching documents:', error);
      showError(error.message || 'Erro ao carregar documentos');
    } finally {
      setLoading(false);
    }
  }, []);

  // Carregar documentos ao montar o componente
  useEffect(() => {
    fetchDocuments();
  }, [fetchDocuments]);

  // Manipuladores de eventos
  const handlePageChange = useCallback((page: number) => {
    setPagination(prev => ({
      ...prev,
      currentPage: page
    }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);
  
  const handleFilterChange = useCallback((key: keyof typeof filters, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
    setPagination(prev => ({
      ...prev,
      currentPage: 1 // Reset para a primeira página ao mudar filtros
    }));
  }, []);

  const handleApprove = async (documentId: string) => {
    try {
      const updateData: DocumentUpdate = {
        status: 'Aprovado',
        rejection_reason: null
      };
      
      const { error } = await supabase
        .from('documents')
        .update(updateData)
        .eq('id', documentId);

      if (error) throw error;
      
      showSuccess('Documento aprovado com sucesso!');
      await fetchDocuments();
    } catch (error) {
      console.error('Error approving document:', error);
      showError('Erro ao aprovar documento');
    }
  };

  const handleReject = async () => {
    if (!rejectingDoc || !rejectionReason.trim()) {
      showError('Por favor, informe o motivo da rejeição');
      return;
    }

    try {
      const updateData: DocumentUpdate = {
        status: 'Rejeitado',
        rejection_reason: rejectionReason
      };
      
      const { error } = await supabase
        .from('documents')
        .update(updateData)
        .eq('id', rejectingDoc);

      if (error) throw error;
      
      showSuccess('Documento rejeitado com sucesso!');
      setRejectingDoc(null);
      setRejectionReason('');
      await fetchDocuments();
    } catch (error) {
      console.error('Error rejecting document:', error);
      showError('Erro ao rejeitar documento');
    }
  };

  // Função auxiliar para obter o nome do usuário
  const getUserName = useCallback((user?: User) => {
    if (!user) return 'Usuário não encontrado';
    
    // Verifica se raw_user_meta_data é um objeto e tem a propriedade name
    if (user.raw_user_meta_data && 
        typeof user.raw_user_meta_data === 'object' && 
        'name' in user.raw_user_meta_data && 
        typeof user.raw_user_meta_data.name === 'string') {
      return user.raw_user_meta_data.name;
    }
    
    return user.email || 'Usuário sem nome';
  }, []);

  // Função para obter o ícone de status
  const getStatusIcon = useCallback((status: DocumentStatus) => {
    switch (status) {
      case 'Aprovado':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'Rejeitado':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-yellow-500" />;
    }
  }, []);

  // Função para obter a classe de cor do status
  const getStatusColor = useCallback((status: DocumentStatus) => {
    switch (status) {
      case 'Aprovado':
        return 'bg-green-100 text-green-800';
      case 'Rejeitado':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  }, []);

  // Calcular documentos paginados
  const paginatedDocuments = useMemo(() => {
    const startIndex = (pagination.currentPage - 1) * ITEMS_PER_PAGE;
    return filteredDocuments.slice(startIndex, startIndex + ITEMS_PER_PAGE);
  }, [filteredDocuments, pagination.currentPage]);

  // Se estiver carregando, mostrar spinner
  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-800">Gerenciar Documentos</h1>
        <p className="text-muted-foreground">Aprove ou rejeite documentos enviados pelos usuários.</p>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex-1">
              <div className="relative max-w-lg">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nome do documento ou usuário..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Select
                value={filters.status}
                onValueChange={(value) => handleFilterChange('status', value)}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filtrar por status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os status</SelectItem>
                  <SelectItem value="Pendente">Pendentes</SelectItem>
                  <SelectItem value="Aprovado">Aprovados</SelectItem>
                  <SelectItem value="Rejeitado">Rejeitados</SelectItem>
                </SelectContent>
              </Select>
              
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="flex items-center gap-2">
                    <Filter className="h-4 w-4" />
                    Período
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="end">
                  <CalendarComponent
                    initialFocus
                    mode="range"
                    defaultMonth={filters.dateRange?.from}
                    selected={filters.dateRange}
                    onSelect={(range) => handleFilterChange('dateRange', range)}
                    numberOfMonths={2}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Tabela de documentos */}
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle>Documentos Enviados</CardTitle>
              <CardDescription>
                {pagination.totalItems} {pagination.totalItems === 1 ? 'documento encontrado' : 'documentos encontrados'}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Documento
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Usuário
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Data de Envio
                  </th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {paginatedDocuments.length > 0 ? (
                  paginatedDocuments.map((doc) => (
                    <tr key={doc.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <FileText className="flex-shrink-0 h-5 w-5 text-gray-400" />
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{doc.name}</div>
                            <div className="text-sm text-gray-500">
                              {format(new Date(doc.uploaded_at), 'dd/MM/yyyy HH:mm')}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{getUserName(doc.user)}</div>
                        <div className="text-sm text-gray-500">{doc.user?.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {format(new Date(doc.uploaded_at), 'dd/MM/yyyy')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(doc.status)}`}>
                          {getStatusIcon(doc.status)}
                          <span className="ml-1">{doc.status}</span>
                        </span>
                        {doc.status === 'Rejeitado' && doc.rejection_reason && (
                          <div className="mt-1 text-xs text-red-600">Motivo: {doc.rejection_reason}</div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex justify-end space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            asChild
                          >
                            <a 
                              href={doc.file_url} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:text-blue-900"
                            >
                              <ExternalLink className="h-4 w-4 mr-1" />
                              Visualizar
                            </a>
                          </Button>
                          
                          {doc.status === 'Pendente' && (
                            <>
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-green-600 border-green-200 hover:bg-green-50"
                                onClick={() => handleApprove(doc.id)}
                              >
                                Aprovar
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="text-red-600 border-red-200 hover:bg-red-50"
                                onClick={() => setRejectingDoc(doc.id)}
                              >
                                Rejeitar
                              </Button>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} className="px-6 py-4 text-center text-sm text-gray-500">
                      Nenhum documento encontrado
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Paginação */}
          {pagination.totalPages > 1 && (
            <div className="mt-6 flex items-center justify-between">
              <div className="text-sm text-gray-700">
                Mostrando <span className="font-medium">
                  {Math.min((pagination.currentPage - 1) * ITEMS_PER_PAGE + 1, pagination.totalItems)}
                </span> a <span className="font-medium">
                  {Math.min(pagination.currentPage * ITEMS_PER_PAGE, pagination.totalItems)}
                </span> de <span className="font-medium">{pagination.totalItems}</span> resultados
              </div>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(pagination.currentPage - 1)}
                  disabled={pagination.currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Anterior
                </Button>
                <div className="flex items-center space-x-1">
                  {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                    // Mostrar páginas próximas à atual
                    let pageNum;
                    if (pagination.totalPages <= 5) {
                      pageNum = i + 1;
                    } else if (pagination.currentPage <= 3) {
                      pageNum = i + 1;
                    } else if (pagination.currentPage >= pagination.totalPages - 2) {
                      pageNum = pagination.totalPages - 4 + i;
                    } else {
                      pageNum = pagination.currentPage - 2 + i;
                    }
                    
                    return (
                      <Button
                        key={pageNum}
                        variant={pagination.currentPage === pageNum ? "default" : "outline"}
                        size="sm"
                        onClick={() => handlePageChange(pageNum)}
                        className={pagination.currentPage === pageNum ? "font-bold" : ""}
                      >
                        {pageNum}
                      </Button>
                    );
                  })}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(pagination.currentPage + 1)}
                  disabled={pagination.currentPage === pagination.totalPages}
                >
                  Próxima
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal de Rejeição */}
      {rejectingDoc && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-medium mb-4">Motivo da Rejeição</h3>
            <textarea
              className="w-full p-2 border rounded-md mb-4 h-32"
              placeholder="Informe o motivo da rejeição..."
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
            />
            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => {
                  setRejectingDoc(null);
                  setRejectionReason('');
                }}
              >
                Cancelar
              </Button>
              <Button
                variant="destructive"
                onClick={handleReject}
                disabled={!rejectionReason.trim()}
              >
                Confirmar Rejeição
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageDocuments;
