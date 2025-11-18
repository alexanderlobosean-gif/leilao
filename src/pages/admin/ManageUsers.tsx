"use client";

import { useEffect, useState, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, UserPlus, Pencil, Check, X, ChevronLeft, ChevronRight, Filter, Trash2 } from 'lucide-react';
import { debounce } from 'lodash';
import { supabase } from '@/lib/supabase';
import { showSuccess, showError } from '@/utils/toast';

interface Profile {
  id: string;
  email: string;
  user_type: string;
  created_at: string;
  is_active: boolean;
  name?: string;
}

const ITEMS_PER_PAGE = 10;

const ManageUsers = () => {
  const [users, setUsers] = useState<Profile[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    userType: 'all',
    status: 'all',
  });
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
  });
  const [editingUser, setEditingUser] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({
    user_type: '',
    is_active: true
  });

  // Debounce para a busca
  const debouncedFilter = useCallback(
    debounce(() => {
      applyFilters();
    }, 300),
    [users, filters, searchTerm]
  );

  useEffect(() => {
    fetchUsers();
  }, [pagination.currentPage]);

  useEffect(() => {
    debouncedFilter();
    return () => {
      debouncedFilter.cancel();
    };
  }, [searchTerm, filters, debouncedFilter]);

  const applyFilters = () => {
    let result = [...users];

    // Aplicar filtro de busca
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(user => 
        user.email.toLowerCase().includes(term) ||
        (user.name?.toLowerCase().includes(term) ?? false)
      );
    }

    // Aplicar filtro de tipo de usuário
    if (filters.userType !== 'all') {
      result = result.filter(user => user.user_type === filters.userType);
    }

    // Aplicar filtro de status
    if (filters.status !== 'all') {
      const statusFilter = filters.status === 'active';
      result = result.filter(user => user.is_active === statusFilter);
    }

    // Atualizar a paginação
    const totalPages = Math.ceil(result.length / ITEMS_PER_PAGE);
    setPagination(prev => ({
      ...prev,
      totalPages,
      totalItems: result.length,
      currentPage: prev.currentPage > totalPages && totalPages > 0 ? totalPages : prev.currentPage
    }));

    // Aplicar paginação
    const startIndex = (pagination.currentPage - 1) * ITEMS_PER_PAGE;
    const paginatedResult = result.slice(startIndex, startIndex + ITEMS_PER_PAGE);
    
    setFilteredUsers(paginatedResult);
  };

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      setUsers((data || []) as any);
      applyFilters();
    } catch (error: any) {
      console.error('Error fetching users:', error);
      showError(error.message || 'Erro ao carregar usuários');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (user: Profile) => {
    setEditingUser(user.id);
    setEditForm({
      user_type: user.user_type || 'user',
      is_active: user.is_active ?? true
    });
  };

  const handleSave = async (userId: string) => {
    try {
      const { error } = await supabase
        .from('users')
        .update({
          user_type: editForm.user_type,
          is_active: editForm.is_active,
        })
        .eq('id', userId);

      if (error) throw error;
      
      showSuccess('Usuário atualizado com sucesso!');
      setEditingUser(null);
      fetchUsers();
    } catch (error) {
      console.error('Error updating user:', error);
      showError('Erro ao atualizar usuário');
    }
  };

  const handlePageChange = (page: number) => {
    setPagination(prev => ({
      ...prev,
      currentPage: page
    }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
    setPagination(prev => ({
      ...prev,
      currentPage: 1 // Reset para a primeira página ao mudar filtros
    }));
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      const { error: deleteMetaError } = await supabase.from('profiles').delete().eq('id', userId);
      if (deleteMetaError) throw deleteMetaError;

      showSuccess('Usuário excluído com sucesso.');
      fetchUsers();
    } catch (error: any) {
      console.error('Erro ao excluir usuário:', error);
      showError(error.message || 'Erro ao excluir usuário');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">Gerenciar Usuários</h1>
          <p className="text-muted-foreground">Visualize e gerencie os usuários do sistema.</p>
        </div>
        <Button disabled>
          <UserPlus className="h-4 w-4 mr-2" />
          Adicionar Usuário (via cadastro do site)
        </Button>
      </div>

      <Card>
        <CardContent className="pt-6 space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar usuários por nome ou e-mail..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-muted-foreground" />
              <Select 
                value={filters.userType}
                onValueChange={(value) => handleFilterChange('userType', value)}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Tipo de usuário" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os tipos</SelectItem>
                  <SelectItem value="admin">Administrador</SelectItem>
                  <SelectItem value="moderator">Moderador</SelectItem>
                  <SelectItem value="user">Usuário</SelectItem>
                </SelectContent>
              </Select>

              <Select 
                value={filters.status}
                onValueChange={(value) => handleFilterChange('status', value)}
              >
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="active">Ativos</SelectItem>
                  <SelectItem value="inactive">Inativos</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          {pagination.totalItems > 0 && (
            <div className="text-sm text-muted-foreground">
              Mostrando {Math.min((pagination.currentPage - 1) * ITEMS_PER_PAGE + 1, pagination.totalItems)} 
              a {Math.min(pagination.currentPage * ITEMS_PER_PAGE, pagination.totalItems)} 
              de {pagination.totalItems} usuário{pagination.totalItems !== 1 ? 's' : ''}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <CardTitle>Lista de Usuários</CardTitle>
              <CardDescription>
                {pagination.totalItems} usuário{pagination.totalItems !== 1 ? 's' : ''} encontrado{pagination.totalItems !== 1 ? 's' : ''}
              </CardDescription>
            </div>
            {pagination.totalPages > 1 && (
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(pagination.currentPage - 1)}
                  disabled={pagination.currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <div className="text-sm text-muted-foreground">
                  Página {pagination.currentPage} de {pagination.totalPages}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(pagination.currentPage + 1)}
                  disabled={pagination.currentPage >= pagination.totalPages}
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nome</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">E-mail</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Ações</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredUsers.map((user) => (
                  <tr key={user.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-gray-900">
                        {user.name || 'Sem nome'}
                      </div>
                      <div className="text-sm text-gray-500">
                        {new Date(user.created_at).toLocaleDateString('pt-BR')}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {user.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {editingUser === user.id ? (
                        <select
                          className="border rounded p-1 text-sm"
                          value={editForm.user_type}
                          onChange={(e) => setEditForm({...editForm, user_type: e.target.value})}
                        >
                          <option value="user">Usuário</option>
                          <option value="admin">Administrador</option>
                          <option value="moderator">Moderador</option>
                        </select>
                      ) : (
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          user.user_type === 'admin' 
                            ? 'bg-purple-100 text-purple-800' 
                            : user.user_type === 'moderator'
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-green-100 text-green-800'
                        }`}>
                          {user.user_type === 'admin' 
                            ? 'Administrador' 
                            : user.user_type === 'moderator'
                            ? 'Moderador'
                            : 'Usuário'}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {editingUser === user.id ? (
                        <select
                          className="border rounded p-1 text-sm"
                          value={editForm.is_active ? 'active' : 'inactive'}
                          onChange={(e) => setEditForm({...editForm, is_active: e.target.value === 'active'})}
                        >
                          <option value="active">Ativo</option>
                          <option value="inactive">Inativo</option>
                        </select>
                      ) : (
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          user.is_active ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {user.is_active ? 'Ativo' : 'Inativo'}
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      {editingUser === user.id ? (
                        <div className="flex space-x-2">
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => handleSave(user.id)}
                          >
                            <Check className="h-4 w-4 text-green-600" />
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => setEditingUser(null)}
                          >
                            <X className="h-4 w-4 text-red-600" />
                          </Button>
                        </div>
                      ) : (
                        <div className="flex space-x-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleEdit(user)}
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-red-600 border-red-200 hover:bg-red-50"
                            onClick={() => {
                              if (window.confirm('Tem certeza que deseja excluir este usuário? Essa ação não pode ser desfeita.')) {
                                handleDeleteUser(user.id);
                              }
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

    </div>
  );
};

export default ManageUsers;
