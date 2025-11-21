"use client";

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Mail, Phone, MapPin, Loader2 } from "lucide-react";
import { showSuccess, showError } from "@/utils/toast";

const Contact = () => {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Simular envio de formulário
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500)); // Simula delay de API
      console.log({ name, email, message });
      showSuccess("Sua mensagem foi enviada com sucesso! Em breve entraremos em contato.");
      setName("");
      setEmail("");
      setMessage("");
    } catch (error) {
      showError("Ocorreu um erro ao enviar sua mensagem. Tente novamente.");
      console.error("Erro ao enviar contato:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 flex flex-col">
      <Header />
      <main className="flex-grow max-w-7xl mx-auto p-6 w-full space-y-8">
        <h2 className="text-4xl font-bold text-gray-800 text-center mb-8">Fale Conosco</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <Card>
            <CardHeader>
              <CardTitle>Envie-nos uma Mensagem</CardTitle>
              <CardDescription>Preencha o formulário abaixo e entraremos em contato.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="grid gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="name">Nome Completo</Label>
                  <Input
                    id="name"
                    placeholder="Seu nome"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    disabled={loading}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="seu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={loading}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="message">Mensagem</Label>
                  <Textarea
                    id="message"
                    placeholder="Sua mensagem..."
                    rows={5}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    required
                    disabled={loading}
                  />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" /> Enviando...
                    </>
                  ) : (
                    "Enviar Mensagem"
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Nossas Informações de Contato</CardTitle>
              <CardDescription>Estamos aqui para ajudar!</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-3">
                <Mail className="h-5 w-5 text-emerald-600" />
                <p className="text-gray-700">ti@grupotrivelli.app</p>
              </div>
              <div className="flex items-center space-x-3">
                <Phone className="h-5 w-5 text-emerald-600" />
                <p className="text-gray-700">(14) 3149-0697 | (14) 3149-0697</p>
              </div>
              <div className="flex items-start space-x-3">
                <MapPin className="h-5 w-5 text-emerald-600 mt-1" />
                <p className="text-gray-700">
                  Av. Comendador José da Silva Martha, 42-2 – Jardim Ouro Verde<br />
                  Bauru – SP<br />
                  CEP: 17054-630
                </p>
              </div>
              <div className="mt-2 text-gray-700 text-sm space-y-1">
                <p>Segunda à Sexta-feira das 09:00h às 18:00h</p>
                <p>Sábado das 09:00h às 14:00h</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Leilão Online - Como funciona? (mesma seção da Home) */}
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
};

export default Contact;