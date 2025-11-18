"use client";

import React from "react";
import { Link } from "react-router-dom";
import {
  Facebook,
  Instagram,
  Linkedin,
  Youtube,
  Mail,
  Phone,
  MapPin,
} from "lucide-react";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="mt-12 border-t border-gray-800">
      {/* Bloco principal escuro com colunas */}
      <div className="bg-[#041324] text-gray-300">
        <div className="max-w-7xl mx-auto px-6 py-8 grid grid-cols-1 md:grid-cols-5 gap-8 text-xs md:text-sm">
          {/* INSTITUCIONAL */}
          <div>
            <h3 className="text-[11px] font-semibold text-white uppercase tracking-wide mb-3">
              Institucional
            </h3>
            <ul className="space-y-1.5">
              <li>
                <Link
                  to="/about"
                  className="hover:text-emerald-400 transition-colors"
                >
                  Quem Somos
                </Link>
              </li>
              <li>
                <a href="#" className="hover:text-emerald-400 transition-colors">
                  Termos de Responsabilidade
                </a>
              </li>
              <li>
                <Link
                  to="/contact"
                  className="hover:text-emerald-400 transition-colors"
                >
                  Fale Conosco
                </Link>
              </li>
            </ul>
          </div>

          {/* LEILÕES */}
          <div>
            <h3 className="text-[11px] font-semibold text-white uppercase tracking-wide mb-3">
              Leilões
            </h3>
            <ul className="space-y-1.5">
              <li>
                <a href="#" className="hover:text-emerald-400 transition-colors">
                  Termos de Uso
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-emerald-400 transition-colors">
                  Entenda Sobre Leilões
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-emerald-400 transition-colors">
                  Perguntas Frequentes
                </a>
              </li>
            </ul>
          </div>

          {/* ÁREA DO CLIENTE */}
          <div>
            <h3 className="text-[11px] font-semibold text-white uppercase tracking-wide mb-3">
              Área do Cliente
            </h3>
            <ul className="space-y-1.5">
              <li>
                <Link
                  to="/register"
                  className="hover:text-emerald-400 transition-colors"
                >
                  Cadastre-se
                </Link>
              </li>
              <li>
                <Link
                  to="/login"
                  className="hover:text-emerald-400 transition-colors"
                >
                  Login
                </Link>
              </li>
              <li>
                <a href="#" className="hover:text-emerald-400 transition-colors">
                  Esqueci Minha Senha
                </a>
              </li>
            </ul>
          </div>

          {/* CENTRAL DE ATENDIMENTO */}
          <div>
            <h3 className="text-[11px] font-semibold text-white uppercase tracking-wide mb-3">
              Central de Atendimento
            </h3>
            <ul className="space-y-1.5">
              <li className="flex items-center gap-2">
                <Phone className="h-3.5 w-3.5 text-emerald-400" />
                <span>(14) 3149-0697</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="h-3.5 w-3.5 text-emerald-400" />
                <span>(14) 3149-0697</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-3.5 w-3.5 text-emerald-400" />
                <span>ti@grupotrivelli.app</span>
              </li>
              <li className="mt-2 text-[11px] text-gray-400">
                Segunda à Sexta-feira das 09:00h às 18:00h
                <br />
                Sábado das 09:00h às 14:00h
              </li>
            </ul>
          </div>

          {/* VISITAÇÃO DOS LOTES */}
          <div>
            <h3 className="text-[11px] font-semibold text-white uppercase tracking-wide mb-3">
              Visitação dos Lotes
            </h3>
            <p className="text-[11px] text-gray-300 mb-2">
              Um dia antes do leilão, das 09:00h às 12:00h *
            </p>
            <p className="text-[11px] text-gray-300">
              Av. Comendador José da Silva Martha, 42-2 – Jardim Ouro Verde
              <br />
              Bauru – SP
              <br />
              CEP: 17054-630
            </p>
            <p className="mt-2 text-[11px] text-gray-400">
              * Mediante agendamento prévio
            </p>
          </div>
        </div>
      </div>

      {/* Faixa inferior turquesa */}
      <div className="bg-[#08B8C6]">
        <div className="max-w-7xl mx-auto px-6 py-3 text-center text-[11px] text-white space-y-1">
          <p>© {currentYear}. Todos os direitos reservados por Grupo Grupo Trivelli</p>
          <p>
            A cópia ou reprodução não autorizada do conteúdo deste site poderá acarretar em penas previstas em lei.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;