"use client";

import React, { useState } from "react";
import { Phone, Mail, MessageCircle, X } from "lucide-react";

const ChatWidget: React.FC = () => {
  const [open, setOpen] = useState(false);

  return (
    <div className="fixed bottom-4 right-4 z-40">
      {/* Painel */}
      {open && (
        <div className="mb-3 w-72 md:w-80 rounded-2xl bg-[#1f2937] text-white shadow-xl overflow-hidden border border-slate-800">
          <div className="flex items-center justify-between px-4 py-2 bg-[#111827]">
            <span className="text-xs font-semibold">Atendimento Grupo Trivelli</span>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="h-6 w-6 rounded-full bg-rose-500 flex items-center justify-center text-white text-xs hover:bg-rose-600"
            >
              <X className="h-3 w-3" />
            </button>
          </div>

          <div className="bg-[#111827] px-3 py-2 space-y-2">
            {/* Telefone */}
            <button
              type="button"
              className="w-full flex items-center rounded-xl overflow-hidden bg-white text-gray-900 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="h-full bg-[#2563eb] flex items-center justify-center px-3 py-3">
                <Phone className="h-5 w-5 text-white" />
              </div>
              <div className="flex-1 text-left px-3 py-2">
                <p className="text-xs font-semibold">Conversar com um de nossos atendentes</p>
              </div>
            </button>

            {/* WhatsApp */}
            <button
              type="button"
              className="w-full flex items-center rounded-xl overflow-hidden bg-white text-gray-900 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="h-full bg-[#22c55e] flex items-center justify-center px-3 py-3">
                <MessageCircle className="h-5 w-5 text-white" />
              </div>
              <div className="flex-1 text-left px-3 py-2">
                <p className="text-xs font-semibold">Tirar dúvidas pelo WhatsApp</p>
              </div>
            </button>

            {/* E-mail */}
            <button
              type="button"
              className="w-full flex items-center rounded-xl overflow-hidden bg-white text-gray-900 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="h-full bg-[#0ea5e9] flex items-center justify-center px-3 py-3">
                <Mail className="h-5 w-5 text-white" />
              </div>
              <div className="flex-1 text-left px-3 py-2">
                <p className="text-xs font-semibold">Enviar um e-mail</p>
              </div>
            </button>
          </div>

          <div className="bg-[#08B8C6] px-4 py-2 text-[11px] text-white flex items-center justify-between">
            <span>Atendimento de Segunda à Sexta-Feira das 09:00 às 18:00h.</span>
            <div className="ml-2 h-8 w-8 rounded-full bg-white/10 border border-white/40 flex items-center justify-center">
              <MessageCircle className="h-4 w-4 text-white" />
            </div>
          </div>
        </div>
      )}

      {/* Botão flutuante */}
      <button
        type="button"
        onClick={() => setOpen((prev) => !prev)}
        className="h-12 w-12 rounded-full bg-[#08B8C6] shadow-lg flex items-center justify-center border-2 border-white hover:bg-[#06a4b1]"
      >
        <MessageCircle className="h-6 w-6 text-white" />
      </button>
    </div>
  );
};

export default ChatWidget;
