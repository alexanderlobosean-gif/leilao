import { useEffect, useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Link } from 'react-router-dom';
import { fetchAllLots } from '@/services/lotService';

interface Leilao {
  id: string;
  title: string;
  short_description: string;
  description: string;
  image_url: string;
  image_urls?: string | null;
  initial_bid: number;
  current_bid: number;
  bids_count: number;
  ends_at: string;
  status: string;
  created_at: string;
}

const Leiloes = () => {
  const [leiloes, setLeiloes] = useState<Leilao[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("todas");

  useEffect(() => {
    const carregarLeiloes = async () => {
      try {
        setLoading(true);
        console.log('🔍 Iniciando carregamento dos leilões...');
        const dados = await fetchAllLots();
        console.log('📊 Dados recebidos:', dados);
        
        if (dados && Array.isArray(dados)) {
          console.log(`✅ ${dados.length} leilões carregados com sucesso`);
          setLeiloes(dados);
        } else {
          console.warn('⚠️ Nenhum dado retornado ou formato inválido');
          setLeiloes([]);
        }
      } catch (err) {
        const message = (err as any)?.message || 'Não foi possível carregar os leilões. Tente novamente mais tarde.';
        console.error('❌ Erro ao carregar leilões:', err);
        setError(message);
      } finally {
        setLoading(false);
      }
    };

    carregarLeiloes();
  }, []);

  const filteredLeiloes = leiloes.filter((lot: any) => {
    const matchesSearch =
      lot.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lot.short_description.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory =
      selectedCategory === "todas" ||
      (lot.category && lot.category.toLowerCase() === selectedCategory.toLowerCase());

    return matchesSearch && matchesCategory;
  });

  // Função para formatar a data de término
  const formatarData = (dataString: string) => {
    const data = new Date(dataString);
    return data.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // Função para formatar valor em moeda
  const formatarMoeda = (valor: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(valor);
  };

  const getLeilaoCardImage = (leilao: Leilao) => {
    const raw = leilao.image_urls as string | null | undefined;
    if (raw) {
      const first = raw
        .split(/[\n,]+/)
        .map((s) => s.trim())
        .filter((s) => !!s)[0];
      if (first) return first;
    }
    return leilao.image_url;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 text-gray-800 flex flex-col">
        <Header />
        <main className="flex-grow container mx-auto px-4 py-8 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Carregando leilões...</p>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 text-gray-800 flex flex-col">
        <Header />
        <main className="flex-grow container mx-auto px-4 py-8 flex items-center justify-center">
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
            <strong className="font-bold">Erro! </strong>
            <span className="block sm:inline">{error}</span>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 flex flex-col">
      <Header />
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="mb-6 flex flex-col gap-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">Leilões em Andamento</h1>
            <p className="text-gray-600">Confira todos os lotes disponíveis e utilize os filtros para encontrar o que procura.</p>
          </div>

          {/* Barra de busca acima das categorias */}
          <div className="w-full md:w-1/2">
            <Input
              type="text"
              placeholder="Buscar por título ou descrição do lote"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="text-sm"
            />
          </div>

          {/* Barra de categorias, igual à Home */}
          <div className="flex flex-wrap items-center gap-3 text-xs md:text-sm text-gray-700">
            {[
              { key: 'todas', label: 'Todas' },
              { key: 'veiculos', label: 'Veículos' },
              { key: 'motocicletas', label: 'Motocicletas' },
              { key: 'caminhoes', label: 'Caminhões' },
              { key: 'industrial_maquinas', label: 'Industrial e Máquinas' },
              { key: 'agricolas', label: 'Agrícolas' },
              { key: 'embarcacoes', label: 'Embarcações' },
              { key: 'imoveis', label: 'Imóveis' },
            ].map((cat) => (
              <button
                key={cat.key}
                type="button"
                onClick={() => setSelectedCategory(cat.key)}
                className={`px-3 py-1.5 rounded-full border text-xs md:text-[13px] transition-colors ${
                  selectedCategory === cat.key
                    ? 'bg-emerald-600 border-emerald-600 text-white'
                    : 'bg-white border-gray-200 text-gray-700 hover:border-emerald-400 hover:text-emerald-700'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {filteredLeiloes.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">Nenhum leilão disponível no momento.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {filteredLeiloes.map((leilao: Leilao) => {
              return (
                <article
                  key={leilao.id}
                  className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                >
                  <img
                    src={getLeilaoCardImage(leilao)}
                    alt={leilao.title}
                    className="w-full h-40 object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://via.placeholder.com/300x200?text=Sem+imagem';
                    }}
                  />
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-gray-800 text-lg">
                        {leilao.title}
                      </h3>
                      <span
                        className={`text-xs px-2 py-1 rounded-full font-medium ${
                          leilao.status === 'aberto'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-gray-100 text-gray-700'
                        }`}
                      >
                        {leilao.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 mb-3">
                      {leilao.short_description}
                    </p>

                    <div className="grid grid-cols-2 gap-2 text-sm mb-4">
                      <div>
                        <div className="text-xs text-gray-500">Lance atual</div>
                        <div className="font-bold text-emerald-600 text-lg">
                          R$ {leilao.current_bid.toLocaleString('pt-BR')}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-gray-500">Tempo restante</div>
                        <div className="font-mono text-base text-gray-700">
                          {formatarData(leilao.ends_at)}
                        </div>
                      </div>
                    </div>

                    <Button
                      className="w-full bg-emerald-600 hover:bg-emerald-700 text-white rounded-md py-2 text-sm"
                      asChild
                    >
                      <Link to={`/lot/${leilao.id}`} className="w-full text-center">
                        Ver Lote
                      </Link>
                    </Button>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
};

export default Leiloes;
