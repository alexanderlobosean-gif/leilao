"use client";

import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { UploadCloud, FileText, Loader2 } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { fetchUserDocuments, uploadDocumentFile, saveDocumentMetadata, updateDocumentFileAndMetadata, Document } from '@/services/userDataService';
import { showSuccess, showError } from '@/utils/toast';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'; // Importando componentes do Dialog

const Documents = () => {
  const { user } = useAuth();
  const [documents, setDocuments] = useState<Document[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [documentName, setDocumentName] = useState('');

  // Estados para a funcionalidade de substituição
  const [isReplacing, setIsReplacing] = useState(false);
  const [documentToReplace, setDocumentToReplace] = useState<Document | null>(null);
  const [replaceFile, setReplaceFile] = useState<File | null>(null);
  const [replaceDocumentName, setReplaceDocumentName] = useState('');
  const [replacingLoading, setReplacingLoading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const getDocuments = async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }
    try {
      const userDocuments = await fetchUserDocuments(user.id);
      setDocuments(userDocuments);
    } catch (err) {
      setError("Não foi possível carregar seus documentos.");
      showError("Não foi possível carregar seus documentos.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getDocuments();
  }, [user]);

  const handleFileChange = (file: File) => {
    if (file) {
      setSelectedFile(file);
      setDocumentName(file.name.split('.')[0]); // Sugere o nome do arquivo
    } else {
      setSelectedFile(null);
      setDocumentName('');
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      handleFileChange(file);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileChange(e.target.files[0]);
    } else {
      setSelectedFile(null);
      setDocumentName('');
    }
  };

  const handleUpload = async () => {
    if (!user?.id) {
      showError("Usuário não autenticado. Por favor, faça login novamente.");
      return;
    }

    if (!selectedFile) {
      showError("Por favor, selecione um arquivo para enviar.");
      return;
    }

    if (!documentName.trim()) {
      showError("Por favor, insira um nome para o documento.");
      return;
    }

    setUploading(true);
    setError(null);
    
    try {
      // Mostra mensagem de início do upload
      showSuccess("Iniciando upload do documento, aguarde...");
      
      // 1. Faz o upload do arquivo para o storage
      const fileUrl = await uploadDocumentFile(user.id, selectedFile);
      
      // 2. Salva os metadados no banco de dados
      await saveDocumentMetadata(user.id, documentName.trim(), fileUrl);
      
      // 3. Atualiza a lista de documentos
      await getDocuments();
      
      // 4. Limpa o formulário
      setSelectedFile(null);
      setDocumentName('');
      
      // 5. Mostra mensagem de sucesso
      showSuccess("Documento enviado com sucesso! Ele está aguardando verificação.");
      
    } catch (err: any) {
      const errorMessage = err.message || 'Erro desconhecido ao enviar o documento';
      console.error('Erro detalhado:', err);
      
      // Mensagens de erro mais amigáveis
      if (errorMessage.includes('already exists')) {
        showError("Um arquivo com este nome já existe. Por favor, renomeie o arquivo e tente novamente.");
      } else if (errorMessage.includes('File size')) {
        showError("O arquivo é muito grande. O tamanho máximo permitido é 5MB.");
      } else if (errorMessage.includes('Tipo de arquivo')) {
        showError("Tipo de arquivo não suportado. Por favor, envie um arquivo PDF, JPG ou PNG.");
      } else {
        showError(`Erro ao enviar documento: ${errorMessage}`);
      }
    } finally {
      setUploading(false);
    }
  };

  const handleReplaceFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setReplaceFile(event.target.files[0]);
      // Se o nome de substituição não foi preenchido, sugere o nome do arquivo
      if (!replaceDocumentName) {
        setReplaceDocumentName(event.target.files[0].name.split('.')[0]);
      }
    } else {
      setReplaceFile(null);
    }
  };

  const handleReplaceSubmit = async () => {
    if (!user?.id || !documentToReplace || !replaceFile || !replaceDocumentName) {
      showError("Por favor, selecione um novo arquivo e insira um nome para o documento.");
      return;
    }

    setReplacingLoading(true);
    try {
      await updateDocumentFileAndMetadata(documentToReplace.id, user.id, replaceFile, replaceDocumentName);
      showSuccess("Documento substituído com sucesso! Ele está aguardando nova verificação.");
      setIsReplacing(false);
      setDocumentToReplace(null);
      setReplaceFile(null);
      setReplaceDocumentName('');
      getDocuments(); // Recarrega a lista de documentos
    } catch (err: any) {
      showError(`Erro ao substituir documento: ${err.message || 'Erro desconhecido'}`);
      console.error(err);
    } finally {
      setReplacingLoading(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Documentos</CardTitle>
          <CardDescription>
            Gerencie seus documentos para verificação e habilitação.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-center py-8">
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-muted-foreground">Carregando seus documentos...</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Documentos</CardTitle>
          <CardDescription>
            Ocorreu um erro ao carregar seus documentos.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="rounded-md bg-red-50 p-4">
            <div className="flex">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">Erro ao carregar documentos</h3>
                <div className="mt-2 text-sm text-red-700">
                  <p>{error}</p>
                </div>
                <div className="mt-4">
                  <button
                    onClick={getDocuments}
                    className="rounded-md bg-red-50 px-2 py-1.5 text-sm font-medium text-red-800 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-600 focus:ring-offset-2 focus:ring-offset-red-50"
                  >
                    Tentar novamente
                  </button>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Documentos</CardTitle>
        <CardDescription>
          Gerencie seus documentos para verificação e habilitação.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Seção de Upload de Documentos */}
        <div className="border p-4 rounded-md space-y-4">
          <h3 className="text-lg font-semibold">Enviar Novo Documento</h3>
          <div className="grid gap-2">
            <Label htmlFor="document-name">Nome do Documento</Label>
            <Input
              id="document-name"
              placeholder="Ex: RG - Frente e Verso"
              value={documentName}
              onChange={(e) => setDocumentName(e.target.value)}
              disabled={uploading}
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="file-upload">Selecionar Arquivo</Label>
            <div 
              className={`mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-md transition-colors ${isDragging ? 'border-primary-500 bg-primary-50' : 'border-gray-300'}`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <div className="space-y-3 text-center">
                <UploadCloud className={`mx-auto h-12 w-12 ${isDragging ? 'text-primary-500' : 'text-gray-400'}`} />
                <div className="flex text-sm text-muted-foreground">
                  <label
                    htmlFor="file-upload"
                    className="relative cursor-pointer rounded-md bg-white font-medium text-primary-600 hover:text-primary-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-primary-500"
                  >
                    <span>Clique para selecionar</span>
                    <input 
                      id="file-upload" 
                      name="file-upload" 
                      type="file" 
                      className="sr-only" 
                      onChange={handleFileInputChange}
                      disabled={uploading}
                      accept=".pdf,.jpg,.jpeg,.png"
                    />
                  </label>
                  <p className="pl-1">ou arraste e solte aqui</p>
                </div>
                <p className="text-xs text-muted-foreground">
                  PDF, JPG ou PNG (até 5MB)
                </p>
                {isDragging && (
                  <p className="text-xs text-primary-600 font-medium">
                    Solte o arquivo para enviar
                  </p>
                )}
              </div>
            </div>
            {selectedFile && (
              <div className="mt-2 flex items-center p-2 text-sm text-muted-foreground bg-gray-50 rounded-md">
                <FileText className="h-5 w-5 mr-3 flex-shrink-0 text-gray-400" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{selectedFile.name}</p>
                  <p className="text-xs text-gray-500">
                    {(selectedFile.size / 1024).toFixed(0)} KB • {selectedFile.type.split('/')[1]?.toUpperCase() || 'Arquivo'}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setSelectedFile(null);
                    setDocumentName('');
                  }}
                  className="text-gray-400 hover:text-gray-500"
                  disabled={uploading}
                >
                  <span className="sr-only">Remover</span>
                  <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
            )}
          </div>
          <Button onClick={handleUpload} disabled={uploading || !selectedFile || !documentName}>
            {uploading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Enviando...
              </>
            ) : (
              <>
                <UploadCloud className="h-4 w-4 mr-2" /> Enviar Documento
              </>
            )}
          </Button>
        </div>

        {/* Lista de Documentos Existentes */}
        <h3 className="text-lg font-semibold">Meus Documentos</h3>
        {documents.length > 0 ? (
          <div className="grid gap-4">
            {documents.map((doc) => (
              <div key={doc.id} className="flex items-center justify-between p-4 border rounded-md">
                <div className="flex items-center gap-3">
                  <FileText className="h-5 w-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium">{doc.name}</p>
                    <p className="text-sm text-muted-foreground">Enviado em: {new Date(doc.uploaded_at).toLocaleDateString('pt-BR')}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {doc.file_url && (
                    <a href={doc.file_url} target="_blank" rel="noopener noreferrer">
                      <Button variant="outline" size="sm">Ver</Button>
                    </a>
                  )}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setDocumentToReplace(doc);
                      setReplaceDocumentName(doc.name); // Preenche com o nome atual
                      setReplaceFile(null); // Limpa o arquivo selecionado anteriormente
                      setIsReplacing(true);
                    }}
                  >
                    Substituir
                  </Button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-center text-muted-foreground">Você não possui documentos enviados.</p>
        )}
      </CardContent>

      {/* Diálogo de Substituição de Documento */}
      <Dialog open={isReplacing} onOpenChange={setIsReplacing}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Substituir Documento</DialogTitle>
            <DialogDescription>
              Selecione um novo arquivo para substituir "{documentToReplace?.name}".
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="replace-document-name">Nome do Documento</Label>
              <Input
                id="replace-document-name"
                value={replaceDocumentName}
                onChange={(e) => setReplaceDocumentName(e.target.value)}
                disabled={replacingLoading}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="replace-file-upload">Novo Arquivo</Label>
              <Input
                id="replace-file-upload"
                type="file"
                onChange={handleReplaceFileChange}
                disabled={replacingLoading}
              />
              {replaceFile && (
                <p className="text-sm text-muted-foreground">Arquivo selecionado: {replaceFile.name}</p>
              )}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsReplacing(false)} disabled={replacingLoading}>
              Cancelar
            </Button>
            <Button onClick={handleReplaceSubmit} disabled={replacingLoading || !replaceFile || !replaceDocumentName}>
              {replacingLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Substituindo...
                </>
              ) : (
                "Substituir"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default Documents;