"use client";

import React from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer"; // Importando o novo componente Footer
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const About = () => {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 flex flex-col">
      <Header />
      <main className="flex-grow max-w-7xl mx-auto p-6 w-full space-y-8">
        <h2 className="text-4xl font-bold text-gray-800 text-center mb-8">Sobre Nós</h2>

        <Card>
          <CardHeader>
            <CardTitle>Nossa Missão</CardTitle>
            <CardDescription>O que nos move e qual o nosso propósito.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-lg text-gray-700">
              Nossa missão é democratizar o acesso a bens de valor através de leilões transparentes, seguros e eficientes.
              Conectamos vendedores e compradores, garantindo as melhores oportunidades e uma experiência de usuário excepcional.
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Nossos Valores</CardTitle>
            <CardDescription>Os princípios que guiam nossas ações.</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="list-disc list-inside text-lg text-gray-700 space-y-2">
              <li><strong>Transparência:</strong> Agimos com clareza em todas as etapas do processo.</li>
              <li><strong>Integridade:</strong> Mantemos os mais altos padrões éticos em todas as nossas operações.</li>
              <li><strong>Inovação:</strong> Buscamos constantemente novas tecnologias para aprimorar nossos serviços.</li>
              <li><strong>Foco no Cliente:</strong> Colocamos as necessidades de nossos usuários no centro de tudo o que fazemos.</li>
              <li><strong>Excelência:</strong> Comprometemo-nos a entregar serviços de alta qualidade.</li>
            </ul>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Nossa História</CardTitle>
            <CardDescription>Uma jornada de crescimento e sucesso.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-lg text-gray-700 mb-4">
              Fundada em [Ano de Fundação], a Leilões Exemplo nasceu da visão de criar uma plataforma de leilões online que fosse acessível e confiável para todos.
              Desde o início, nosso compromisso com a inovação e a satisfação do cliente nos impulsionou a crescer e a expandir nossa atuação.
            </p>
            <p className="text-lg text-gray-700">
              Ao longo dos anos, consolidamos nossa posição no mercado, realizando milhares de leilões bem-sucedidos e ajudando inúmeros clientes a encontrar
              oportunidades únicas em diversas categorias, como veículos, imóveis e máquinas. Continuamos a evoluir, sempre buscando superar as expectativas
              e oferecer a melhor experiência em leilões online.
            </p>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
};

export default About;