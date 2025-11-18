import React from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";

const HowTo: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 flex flex-col">
      <Header />

      <main className="flex-1 max-w-5xl mx-auto px-4 lg:px-6 py-8 space-y-8">
        <section className="bg-white rounded-2xl shadow-sm border border-gray-100 px-6 py-8">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
            Leilão Online - Como funciona?
          </h1>
          <p className="text-sm text-gray-700 mb-3">
            Nesta página você encontra um passo a passo simplificado para participar dos leilões
            online do Grupo Trivelli, desde o cadastro até a retirada do bem arrematado.
          </p>
        </section>

        <section className="space-y-4">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 px-6 py-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">1. Cadastro no site</h2>
            <p className="text-sm text-gray-700 mb-3">
              Para participar dos leilões, você precisa ter um cadastro ativo. Informe seus dados
              pessoais, aceite os termos de uso e envie os documentos necessários para validação.
            </p>
            <Button
              className="bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold px-5 py-2 rounded-full"
              onClick={() => (window.location.href = "/register")}
            >
              Fazer meu cadastro
            </Button>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 px-6 py-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">2. Habilitação no leilão</h2>
            <p className="text-sm text-gray-700">
              Após o cadastro aprovado, escolha o leilão de interesse e solicite habilitação. Em
              alguns casos poderá ser necessário aceitar condições específicas ou efetuar caução.
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 px-6 py-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">3. Acompanhe os lotes</h2>
            <p className="text-sm text-gray-700">
              Analise cuidadosamente as descrições, fotos e condições de venda de cada lote. Sempre
              que possível, visite o pátio nos horários indicados para conhecer os bens
              presencialmente.
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 px-6 py-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-2">4. Lance e arremate</h2>
            <p className="text-sm text-gray-700 mb-3">
              Durante o período do leilão você pode registrar lances pelo site. Ao final, se o seu
              lance for o vencedor, você receberá as instruções para pagamento e retirada do bem.
            </p>
            <p className="text-xs text-gray-500">
              Atenção: lances são irretratáveis e vinculantes, portanto leia com atenção o edital e
              as condições de venda antes de confirmar.
            </p>
          </div>
        </section>

        <section className="bg-white rounded-2xl shadow-sm border border-gray-100 px-6 py-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Dúvidas?</h2>
          <p className="text-sm text-gray-700 mb-3">
            Em caso de dúvidas sobre o funcionamento do leilão online, entre em contato com nossa
            equipe de atendimento.
          </p>
          <Button
            variant="outline"
            className="border-emerald-600 text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800 text-sm font-semibold rounded-full"
            onClick={() => (window.location.href = "/contact")}
          >
            Falar com o atendimento
          </Button>
        </section>
      </main>

      <Footer />
    </div>
  );
};

export default HowTo;
