"use client";

import React, { useEffect, useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer"; // Importando o novo componente Footer
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const About = () => {
  const banners = [
    "https://grupotrivelli.app/PHPs/AUC84UO48TUHE84T.php?id=banner_4fc95f867ba5718fecb5179309ed1030.jpg",
    "https://grupotrivelli.app/PHPs/AUC84UO48TUHE84T.php?id=banner_ddbacb667d2dc40556e880377c4f36bd.jpg",
    "https://grupotrivelli.app/PHPs/AUC84UO48TUHE84T.php?id=banner_afb232199e36b48bdc0cce232ae6c42e.jpg",
  ];

  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrent((prev) => (prev + 1) % banners.length);
    }, 4000);

    return () => clearInterval(interval);
  }, [banners.length]);
  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 flex flex-col">
      <Header />
      <main className="flex-grow max-w-7xl mx-auto p-6 w-full space-y-8">
        <h2 className="text-4xl font-bold text-gray-800 text-center mb-8">Sobre Nós</h2>

        <Card>
          <CardHeader>
            <CardTitle>Quem Somos</CardTitle>
            <CardDescription>Conheça o Grupo Trivelli.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-lg text-gray-700">
              Grupo Trivelli atuando com leilões em território nacional, é especializado na avaliação e venda de ativos físicos por meio de leilões oficiais presenciais e via internet simultaneamente.
              Possuímos equipe especializada para atender todos os setores do mercado de Leiloes como avaliadores, engenheiros de diversas modalidades (civil, mecânico, elétrico/eletrônico e naval) e departamento jurídico contando com Advogados especialista em (cível, internacional público e privado, comercial) para realizar leilões de bancos, seguradoras, Ciretrans, usinas, empresas públicas e privadas e demais comitentes.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Como Atuamos</CardTitle>
            <CardDescription>Estrutura, suporte e tipos de bens.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-lg text-gray-700 mb-4">
              Nossa equipe atua oferecendo todo suporte para realização de médios e grandes eventos, com toda estrutura e sistemas operacionais que fornecem aos compradores informações precisas dos bens a serem leiloados, além de um eficiente serviço de pós-venda, atuando com despachantes e cartórios, proporcionando maior segurança às operações.
            </p>
            <p className="text-lg text-gray-700 mb-4">
              No Grupo Trivelli, você compra e vende máquinas e equipamentos industriais, sucatas, máquinas pesadas, veículos, caminhões e imóveis. Somos especializados na gestão da venda de ativos, conectando compradores e vendedores em um ambiente seguro, abrangente e transparente.
            </p>
            <p className="text-lg text-gray-700">
              Nossa Equipe é representada por leiloeiros oficiais que detém uma vasta experiência e credibilidade no ramo de leilões. Realiza com muito empenho, serviços de alienação de ativos para empresas de diversos segmentos.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Estrutura e Serviços</CardTitle>
            <CardDescription>Infraestrutura completa para leilões presenciais e online.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-lg text-gray-700 mb-4">
              Dispomos de excelente estrutura administrativa e logística, escritório e auditório para realização de leilões on-line e presenciais, com todo material necessário para transmissão dos pregões, ex: computadores modernos, equipamentos de som, foto, vídeo, púlpito, microfone e telões.
            </p>
            <p className="text-lg text-gray-700">
              Com nossa atuação voltada para venda em leilões oficiais de bens como: imóveis e móveis, veículos leves e pesados, máquinas e equipamentos, obras de arte, tratores, sucata entre outros, de forma transparente, com a rapidez e qualidade que o mercado exige dos pregões públicos.
            </p>
            <p className="text-lg text-gray-700 mt-4">
              <strong>IMPORTANTE:</strong> É necessário agendamento prévio via e-mail ou telefone.
            </p>
            <ul className="list-disc list-inside text-lg text-gray-700 mt-2 space-y-1">
              <li>Emissão, envio e entrega de notas</li>
              <li>Entrega de recibos</li>
              <li>Retirada de veículo</li>
            </ul>
          </CardContent>
        </Card>

        <div className="mt-8 w-full">
          <div
            className="relative rounded-2xl w-full h-[48rem] overflow-hidden bg-gray-200"
          >
            {banners.map((src, index) => (
              <img
                key={src}
                loading="lazy"
                className={`absolute inset-0 w-full h-full object-cover object-center transition-opacity duration-700 ${
                  index === current ? "opacity-100" : "opacity-0"
                }`}
                src={src}
                alt={`Banner ${index + 1}`}
              />
            ))}
          </div>
          <div className="flex justify-center gap-2 mt-3">
            {banners.map((_, index) => (
              <span
                key={index}
                className={`w-2 h-2 rounded-full ${
                  index === current ? "bg-gray-600" : "bg-gray-300"
                }`}
              ></span>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default About;