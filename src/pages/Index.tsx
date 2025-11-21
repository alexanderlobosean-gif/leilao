import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import HeroBannerSlider from "@/components/HeroBannerSlider";
import { fetchAllLots, Lot } from "@/services/lotService";
import { showError } from "@/utils/toast";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"; // Importando Card components

const Index = () => {
  const navigate = useNavigate();

  const [lots, setLots] = useState<Lot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [now, setNow] = useState(Date.now());
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("todas");

  useEffect(() => {
    const getLots = async () => {
      try {
        const fetchedLots = await fetchAllLots();
        setLots(fetchedLots);
      } catch (err) {
        const message = (err as any)?.message || "Não foi possível carregar os lotes.";
        setError(message);
        showError(`Erro ao carregar os lotes: ${message}`);
        console.error('❌ Erro em getLots (Index):', err);
      } finally {
        setLoading(false);
      }
    };

    getLots();

    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  function timeLeft(iso: string) {
    const diff = new Date(iso).getTime() - now;
    if (diff <= 0) return "0d 00:00:00";
    const d = Math.floor(diff / (1000 * 60 * 60 * 24));
    const h = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const m = Math.floor((diff / (1000 * 60)) % 60);
    const s = Math.floor((diff / 1000) % 60);
    return `${d}d ${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
  }

  function openLot(lot: Lot) {
    navigate(`/lot/${lot.id}`);
  }

  const getLotCardImage = (lot: Lot) => {
    const raw = (lot as any).image_urls as string | null | undefined;
    if (raw) {
      const first = raw
        .split(/[\n,]+/)
        .map((s) => s.trim())
        .filter((s) => !!s)[0];
      if (first) return first;
    }
    return lot.image_url;
  };

  const filteredLots = lots.filter((lot) => {
    const matchesSearch =
      lot.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      lot.short_description.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategory =
      selectedCategory === "todas" ||
      (lot.category && lot.category.toLowerCase() === selectedCategory.toLowerCase());

    return matchesSearch && matchesCategory;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 text-gray-800 flex flex-col">
        <Header />
        <main className="flex-grow max-w-7xl mx-auto p-6 text-center">
          <p className="text-lg text-gray-600">Carregando lotes...</p>
        </main>
        <Footer />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 text-gray-800 flex flex-col">
        <Header />
        <main className="flex-grow max-w-7xl mx-auto p-6 text-center">
          <p className="text-lg text-red-500">{error}</p>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800">
      <Header />

      {/* Hero / área para banners de propaganda */}
      <section className="relative bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-6 space-y-4">
          <HeroBannerSlider />

          {/* Barra de navegação por categorias */}
          <div className="flex flex-wrap items-center gap-3 text-xs md:text-sm text-gray-700">
            {[
              { key: "todas", label: "Todas" },
              { key: "veiculos", label: "Veículos" },
              { key: "motocicletas", label: "Motocicletas" },
              { key: "caminhoes", label: "Caminhões" },
              { key: "industrial_maquinas", label: "Industrial e Máquinas" },
              { key: "agricolas", label: "Agrícolas" },
              { key: "embarcacoes", label: "Embarcações" },
              { key: "imoveis", label: "Imóveis" },
            ].map((cat) => (
              <button
                key={cat.key}
                type="button"
                onClick={() => setSelectedCategory(cat.key)}
                className={`px-3 py-1.5 rounded-full border text-xs md:text-[13px] transition-colors ${
                  selectedCategory === cat.key
                    ? "bg-emerald-600 border-emerald-600 text-white"
                    : "bg-white border-gray-200 text-gray-700 hover:border-emerald-400 hover:text-emerald-700"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      <main className="max-w-7xl mx-auto p-6 space-y-8">
        {/* Seção: Veículos em destaque */}
        <section className="bg-white rounded-2xl shadow p-6">
          <h2 className="text-2xl font-bold text-gray-800">Veículos em destaque</h2>
          <p className="text-sm text-gray-600 mt-2">
            Lotes de carros e utilitários com lances disponíveis.
          </p>

          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {filteredLots.filter((lot) => (lot.category || "").toLowerCase() === "veiculos").length > 0 ? (
              filteredLots
                .filter((lot) => (lot.category || "").toLowerCase() === "veiculos")
                .map((lot) => (
                <article
                  key={lot.id}
                  className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                >
                  <img
                    src={getLotCardImage(lot)}
                    alt={lot.title}
                    className="w-full h-40 object-cover"
                  />
                  <div className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-semibold text-gray-800 text-lg">
                        {lot.title}
                      </h3>
                      <span
                        className={`text-xs px-2 py-1 rounded-full font-medium ${
                          lot.status === "aberto"
                            ? "bg-emerald-100 text-emerald-800"
                            : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {lot.status}
                      </span>
                    </div>
                    <p className="text-sm text-gray-500 mb-3">
                      {lot.short_description}
                    </p>

                    <div className="grid grid-cols-2 gap-2 text-sm mb-4">
                      <div>
                        <div className="text-xs text-gray-500">Lance atual</div>
                        <div className="font-bold text-emerald-600 text-lg">
                          R$ {lot.current_bid.toLocaleString("pt-BR")}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-gray-500">Tempo restante</div>
                        <div className="font-mono text-base text-gray-700">
                          {timeLeft(lot.ends_at)}
                        </div>
                      </div>
                    </div>

                    <Button
                      onClick={() => openLot(lot)}
                      className="w-full bg-emerald-600 hover:bg-emerald-700 text-white rounded-md py-2 text-sm"
                    >
                      Ver Lote
                    </Button>
                  </div>
                </article>
              ))
            ) : (
              <p className="col-span-full text-center text-muted-foreground text-sm">
                Nenhum lote de veículos encontrado.
              </p>
            )}
          </div>
        </section>

        {/* Seção: Motocicletas em destaque */}
        <section className="bg-white rounded-2xl shadow p-6">
          <h2 className="text-2xl font-bold text-gray-800">Motocicletas em destaque</h2>
          <p className="text-sm text-gray-600 mt-2">
            Lotes de motos em leilão.
          </p>

          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {filteredLots.filter((lot) => (lot.category || "").toLowerCase() === "motocicletas").length > 0 ? (
              filteredLots
                .filter((lot) => (lot.category || "").toLowerCase() === "motocicletas")
                .map((lot) => (
                  <article
                    key={lot.id}
                    className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                  >
                    <img
                      src={getLotCardImage(lot)}
                      alt={lot.title}
                      className="w-full h-40 object-cover"
                    />
                    <div className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold text-gray-800 text-lg">
                          {lot.title}
                        </h3>
                        <span
                          className={`text-xs px-2 py-1 rounded-full font-medium ${
                            lot.status === "aberto"
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {lot.status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 mb-3">
                        {lot.short_description}
                      </p>

                      <div className="grid grid-cols-2 gap-2 text-sm mb-4">
                        <div>
                          <div className="text-xs text-gray-500">Lance atual</div>
                          <div className="font-bold text-emerald-600 text-lg">
                            R$ {lot.current_bid.toLocaleString("pt-BR")}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-xs text-gray-500">Tempo restante</div>
                          <div className="font-mono text-base text-gray-700">
                            {timeLeft(lot.ends_at)}
                          </div>
                        </div>
                      </div>

                      <Button
                        onClick={() => openLot(lot)}
                        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white rounded-md py-2 text-sm"
                      >
                        Ver Lote
                      </Button>
                    </div>
                  </article>
                ))
            ) : (
              <p className="col-span-full text-center text-muted-foreground text-sm">
                Nenhum lote de motocicletas encontrado.
              </p>
            )}
          </div>
        </section>

        {/* Seção: Caminhões em destaque */}
        <section className="bg-white rounded-2xl shadow p-6">
          <h2 className="text-2xl font-bold text-gray-800">Caminhões em destaque</h2>
          <p className="text-sm text-gray-600 mt-2">
            Lotes de caminhões e veículos pesados.
          </p>

          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {filteredLots.filter((lot) => (lot.category || "").toLowerCase() === "caminhoes").length > 0 ? (
              filteredLots
                .filter((lot) => (lot.category || "").toLowerCase() === "caminhoes")
                .map((lot) => (
                  <article
                    key={lot.id}
                    className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow"
                  >
                    <img
                      src={lot.image_url}
                      alt={lot.title}
                      className="w-full h-40 object-cover"
                    />
                    <div className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-semibold text-gray-800 text-lg">
                          {lot.title}
                        </h3>
                        <span
                          className={`text-xs px-2 py-1 rounded-full font-medium ${
                            lot.status === "aberto"
                              ? "bg-emerald-100 text-emerald-800"
                              : "bg-gray-100 text-gray-700"
                          }`}
                        >
                          {lot.status}
                        </span>
                      </div>
                      <p className="text-sm text-gray-500 mb-3">
                        {lot.short_description}
                      </p>

                      <div className="grid grid-cols-2 gap-2 text-sm mb-4">
                        <div>
                          <div className="text-xs text-gray-500">Lance atual</div>
                          <div className="font-bold text-emerald-600 text-lg">
                            R$ {lot.current_bid.toLocaleString("pt-BR")}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="text-xs text-gray-500">Tempo restante</div>
                          <div className="font-mono text-base text-gray-700">
                            {timeLeft(lot.ends_at)}
                          </div>
                        </div>
                      </div>

                      <Button
                        onClick={() => openLot(lot)}
                        className="w-full bg-emerald-600 hover:bg-emerald-700 text-white rounded-md py-2 text-sm"
                      >
                        Ver Lote
                      </Button>
                    </div>
                  </article>
                ))
            ) : (
              <p className="col-span-full text-center text-muted-foreground text-sm">
                Nenhum lote de caminhões encontrado.
              </p>
            )}
          </div>
        </section>

        {/* Próximos encerramentos */}
        <section className="bg-white rounded-2xl shadow p-4 mb-6">
          <h4 className="font-semibold text-gray-800">Próximos encerramentos</h4>
          <ul className="mt-3 space-y-2 text-sm text-gray-700">
            {lots
              .filter((l) => new Date(l.ends_at).getTime() > Date.now())
              .sort((a, b) => new Date(a.ends_at).getTime() - new Date(b.ends_at).getTime())
              .map((l) => (
                <li key={l.id} className="flex items-center justify-between border-b border-gray-100 pb-2 last:border-b-0 last:pb-0">
                  <span className="font-medium">{l.title}</span>
                  <span className="font-mono text-gray-600">{timeLeft(l.ends_at)}</span>
                </li>
              ))}
          </ul>
        </section>

        {/* Leilão Online - Como funciona? */}
        <section className="bg-[#F5F5F5] rounded-2xl px-6 py-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
            {/* Bloco de texto à esquerda */}
            <div className="md:col-span-1 space-y-3">
              <h2 className="text-2xl font-bold text-gray-900 leading-snug">
                Leilão Online
                <br />
                Como funciona?
              </h2>
            </div>

            {/* Texto explicativo + botão */}
            <div className="md:col-span-2 space-y-3">
              <p className="text-sm font-semibold text-gray-900">
                Você já pensou em participar de um leilão online? Essa modalidade tem crescido
                muito, oferecendo praticidade, preços competitivos e uma grande variedade de
                produtos.
              </p>
              <p className="text-sm text-gray-700">
                Para aproveitar as oportunidades com segurança, entenda como tudo funciona:
              </p>
              <Button
                className="mt-2 bg-slate-900 hover:bg-slate-950 text-white text-sm font-semibold px-5 py-2 rounded-full"
                onClick={() => navigate("/how-to")}
              >
                Entenda como funciona
              </Button>
            </div>
          </div>

          {/* Área para mapa Google */}
          <div className="mt-4 w-full h-48 md:h-64 rounded-2xl overflow-hidden bg-gray-200">
            <iframe
              title="Localização - Av. Comendador José da Silva Martha, 42-2"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3675.1518087312076!2d-49.063!3d-22.345!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x94bfd722e52f7c0f%3A0x0000000000000000!2sAv.%20Comendador%20Jos%C3%A9%20da%20Silva%20Martha%2C%2042-2%20-%20Jardim%20Ouro%20Verde%2C%20Bauru%20-%20SP!5e0!3m2!1spt-BR!2sbr!4v0000000000000"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            ></iframe>
          </div>

          {/* Botão de call-to-action */}
          <div className="flex justify-center mt-4">
            <Button
              className="bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold px-6 py-2 rounded-full"
              onClick={() => navigate("/register")}
            >
              Cadastre-se agora e participe do Leilão!
            </Button>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}

export default Index;