import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Header from "@/components/Header";
import Footer from "@/components/Footer"; // Importando o novo componente Footer
import { fetchLotById, Lot } from "@/services/lotService";
import { showError, showSuccess } from "@/utils/toast";
import { supabase } from "@/lib/supabaseClient";
import { useAuth } from "@/context/AuthContext";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { requestNewQualification } from "@/services/userDataService";
import BidHistory from "@/components/BidHistory";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

const LotDetail = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, loading: authLoading } = useAuth();
  const [lot, setLot] = useState<Lot | null>(null);
  const [bidIncrementValue, setBidIncrementValue] = useState<string>('');
  const [now, setNow] = useState(Date.now());
  const [loading, setLoading] = useState(true);
  const [placingBid, setPlacingBid] = useState(false);

  const [isQualificationDialogOpen, setIsQualificationDialogOpen] = useState(false);
  const [selectedQualificationType, setSelectedQualificationType] = useState('');
  const [requestingQualificationLoading, setRequestingQualificationLoading] = useState(false);

  useEffect(() => {
    const getLot = async () => {
      if (!id) {
        navigate("/404");
        return;
      }
      try {
        const fetchedLot = await fetchLotById(id);
        if (fetchedLot) {
          setLot(fetchedLot);
        } else {
          navigate("/404");
        }
      } catch (err) {
        showError("Não foi possível carregar os detalhes do lote.");
        console.error(err);
        navigate("/404");
      } finally {
        setLoading(false);
      }
    };

    getLot();

    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, [id, navigate]);

  function timeLeft(iso: string) {
    const diff = new Date(iso).getTime() - now;
    if (diff <= 0) return "0d 00:00:00";
    const d = Math.floor(diff / (1000 * 60 * 60 * 24));
    const h = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const m = Math.floor((diff / (1000 * 60)) % 60);
    const s = Math.floor((diff / 1000) % 60);
    return `${d}d ${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  }

  const handleBidIncrement = (increment: number) => {
    if (!lot) return;
    setBidIncrementValue(String(increment));
  };

  const placeBid = async () => {
    if (!lot) return;

    const incrementAmount = Number(bidIncrementValue);

    if (isNaN(incrementAmount) || incrementAmount <= 0) {
      showError("Por favor, insira um valor de lance válido e positivo.");
      return;
    }

    const totalBidAmount = lot.current_bid + incrementAmount;

    if (totalBidAmount <= lot.current_bid) {
      showError("O lance total deve ser maior que o lance atual.");
      return;
    }
    
    setPlacingBid(true);
    try {
      if (!user) {
        showError("Você precisa estar logado para dar um lance.");
        navigate('/login');
        return;
      }

      const { error: bidError } = await supabase
        .from('bids')
        .insert({
          user_id: user.id,
          lot_id: lot.id,
          lot_title: lot.title,
          bid_amount: totalBidAmount,
          status: 'Pendente',
        });

      if (bidError) {
        throw bidError;
      }

      const { data: updatedLot, error: updateError } = await supabase
        .from('lots')
        .update({
          current_bid: totalBidAmount,
          bids_count: lot.bids_count + 1,
        })
        .eq('id', lot.id)
        .select()
        .single();

      if (updateError) {
        throw updateError;
      }

      setLot(updatedLot as Lot);
      showSuccess("Lance registrado com sucesso!");
      setBidIncrementValue(''); // Limpa o campo após o lance
    } catch (err: any) {
      showError(`Erro ao registrar lance: ${err.message || 'Erro desconhecido'}`);
      console.error(err);
    } finally {
      setPlacingBid(false);
    }
  };

  const handleRequestQualification = async () => {
    if (!user?.id || !selectedQualificationType) {
      showError("Por favor, selecione um tipo de habilitação.");
      return;
    }

    setRequestingQualificationLoading(true);
    try {
      await requestNewQualification(user.id, selectedQualificationType);
      showSuccess("Solicitação de habilitação enviada com sucesso! Ela está aguardando aprovação.");
      setIsQualificationDialogOpen(false);
      setSelectedQualificationType('');
    } catch (err: any) {
      showError(`Erro ao solicitar habilitação: ${err.message || 'Erro desconhecido'}`);
      console.error(err);
    } finally {
      setRequestingQualificationLoading(false);
    }
  };

  const isBidDisabled = lot?.status === "finalizado" || placingBid || !user;
  const nextBidAmount = lot ? lot.current_bid + Number(bidIncrementValue || 0) : 0;

  if (loading || authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 text-gray-800">
        Carregando detalhes do lote...
      </div>
    );
  }

  if (!lot) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 text-gray-800">
        Lote não encontrado.
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800">
      <Header showBackButton={true} />

      <main className="max-w-7xl mx-auto p-6">
        {/* Seção Principal: Imagem, Descrição e Sidebar de Lances */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* Coluna da Esquerda: Imagem e Descrição */}
          <div className="md:col-span-2 bg-white rounded-2xl shadow p-6">
            <img src={lot.image_url} alt={lot.title} className="w-full h-96 object-cover rounded-lg mb-6" />
            <h2 className="text-3xl font-bold text-gray-800 mb-2">{lot.title}</h2>
            <p className="text-lg text-gray-600 mb-4">{lot.short_description}</p>
            <p className="text-sm text-gray-500 mb-4">ID do Lote: {lot.id}</p>
            {/* Placeholder para localização, se houver */}
            <p className="text-sm text-gray-500 mb-4">Localização: Cidade Exemplo, UF</p>
            <p className="text-gray-700 leading-relaxed">{lot.description}</p>
          </div>

          {/* Coluna da Direita: Informações de Lance */}
          <div className="md:col-span-1 space-y-6">
            <Card className="bg-gray-50 shadow-inner">
              <CardHeader>
                <CardTitle className="text-2xl">Informações do Leilão</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <div className="text-sm text-gray-500">Lance atual</div>
                    <div className="text-4xl font-bold text-emerald-600">R$ {lot.current_bid.toLocaleString("pt-BR")}</div>
                    <div className="text-md text-gray-400">{lot.bids_count} lances</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm text-gray-500">Tempo restante</div>
                    <div className="font-mono text-2xl text-gray-700">{timeLeft(lot.ends_at)}</div>
                  </div>
                </div>

                <div className="mt-6">
                  <Label htmlFor="bid-increment-value" className="text-sm text-gray-600">Valor do seu lance (R$)</Label>
                  <div className="flex gap-2 mt-2 mb-3">
                    <Button variant="outline" size="sm" onClick={() => handleBidIncrement(100)} disabled={isBidDisabled}>+100</Button>
                    <Button variant="outline" size="sm" onClick={() => handleBidIncrement(500)} disabled={isBidDisabled}>+500</Button>
                    <Button variant="outline" size="sm" onClick={() => handleBidIncrement(1000)} disabled={isBidDisabled}>+1000</Button>
                  </div>
                  <div className="mt-2 flex gap-2">
                    <Input
                      id="bid-increment-value"
                      type="number"
                      placeholder="0"
                      value={bidIncrementValue}
                      onChange={(e) => setBidIncrementValue(e.target.value)}
                      className="flex-1"
                      min="0"
                      disabled={isBidDisabled}
                    />
                    <Button onClick={placeBid} className="bg-emerald-600 hover:bg-emerald-700 text-white" disabled={isBidDisabled}>
                      {placingBid ? "Dando lance..." : lot.status === "aberto" ? "Dar lance" : "Leilão Finalizado"}
                    </Button>
                  </div>
                  {lot.status === "aberto" && (
                    <p className="text-xs text-gray-500 mt-2">
                      Próximo Lance Total: R$ {nextBidAmount.toLocaleString("pt-BR")}
                    </p>
                  )}
                  {!user && (
                    <p className="text-sm text-red-500 mt-2">Faça login para dar lances.</p>
                  )}
                </div>

                <div className="mt-4 text-center">
                  <Button
                    variant="outline"
                    className="w-full border-emerald-600 text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700"
                    onClick={() => setIsQualificationDialogOpen(true)}
                    disabled={!user}
                  >
                    Habilitar-se para Leilão
                  </Button>
                  {!user && (
                    <p className="text-xs text-red-500 mt-2">Faça login para solicitar habilitação.</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Informações Adicionais (mantido, mas pode ser mesclado com Informações do Lote) */}
            <Card>
              <CardHeader>
                <CardTitle>Status do Lote</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-gray-700 text-sm">
                  <li><span className="font-medium">Status:</span> <span className={`font-semibold ${lot.status === "aberto" ? "text-green-600" : "text-red-600"}`}>{lot.status.toUpperCase()}</span></li>
                  <li><span className="font-medium">Encerramento:</span> {new Date(lot.ends_at).toLocaleString("pt-BR")}</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Seção de Informações do Lote (Detalhes) */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Informações do Lote</CardTitle>
            <CardDescription>Detalhes técnicos e específicos sobre o item em leilão.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 text-sm">
              <div><span className="font-medium">Marca:</span> Exemplo Marca</div>
              <div><span className="font-medium">Modelo:</span> Exemplo Modelo</div>
              <div><span className="font-medium">Ano:</span> 2023</div>
              <div><span className="font-medium">Combustível:</span> Diesel</div>
              <div><span className="font-medium">Placa:</span> ABC-1234</div>
              <div><span className="font-medium">Chassi:</span> 9BWZZZ1234567890</div>
              <div><span className="font-medium">Cor:</span> Azul</div>
              <div><span className="font-medium">Condição:</span> Usado</div>
              {/* Adicione mais campos conforme necessário, usando dados do 'lot' se disponíveis */}
            </div>
          </CardContent>
        </Card>

        {/* Seção de Condições de Venda */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Condições de Venda</CardTitle>
            <CardDescription>Regras e termos para a participação neste leilão.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="prose prose-sm max-w-none text-gray-700">
              <p>
                A participação neste leilão implica na aceitação integral das condições de venda.
                É responsabilidade do arrematante verificar o estado e as características do lote antes de dar o lance.
                Taxas administrativas e impostos podem ser aplicados. Consulte o edital completo para mais informações.
              </p>
              <ul>
                <li>Pagamento em até 24 horas após o arremate.</li>
                <li>Retirada do bem em até 7 dias úteis.</li>
                <li>Custos de transporte por conta do arrematante.</li>
              </ul>
              <p>
                Para dúvidas, entre em contato com nossa equipe de suporte.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Seção de Histórico de Lances */}
        <div className="mt-6">
          <BidHistory lotId={lot.id} />
        </div>
      </main>

      <Footer />

      {/* Diálogo de Solicitação de Habilitação (mantido) */}
      <Dialog open={isQualificationDialogOpen} onOpenChange={setIsQualificationDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Solicitar Habilitação</DialogTitle>
            <DialogDescription>
              Selecione o tipo de habilitação que deseja solicitar para participar de leilões.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="qualification-type">Tipo de Habilitação</Label>
              <Select onValueChange={setSelectedQualificationType} value={selectedQualificationType} disabled={requestingQualificationLoading}>
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
            <Button variant="outline" onClick={() => setIsQualificationDialogOpen(false)} disabled={requestingQualificationLoading}>
              Cancelar
            </Button>
            <Button onClick={handleRequestQualification} disabled={requestingQualificationLoading || !selectedQualificationType}>
              {requestingQualificationLoading ? (
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
    </div>
  );
};

export default LotDetail;