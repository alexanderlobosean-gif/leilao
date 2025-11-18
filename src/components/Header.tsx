import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowLeft, Search } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

interface HeaderProps {
  showBackButton?: boolean;
}

const Header: React.FC<HeaderProps> = ({ showBackButton = false }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, signOut, loading } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");

  const handleLogout = async () => {
    await signOut();
  };

  return (
    <header className="bg-white shadow-sm sticky top-0 z-30">
      <div className="border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 lg:px-6 py-3 flex flex-col gap-2">
          {/* Linha 1: logo + menu */}
          <div className="flex items-center gap-6">
            {/* Logo à esquerda */}
            <button
              type="button"
              onClick={() => navigate("/")}
              className="flex items-center gap-3 focus:outline-none"
            >
              <img
                src="/principal_07.png"
                alt="Grupo Trivelli Leilões"
                className="h-10 w-auto"
              />
            </button>

            {/* Menu principal */}
            <nav className="flex items-center gap-6 text-sm text-gray-700">
              <Link
                to="/"
                className={`pb-1 text-xs font-medium border-b-2 transition-colors ${
                  location.pathname === "/"
                    ? "border-emerald-600 text-emerald-700"
                    : "border-transparent hover:text-emerald-700"
                }`}
              >
                Início
              </Link>
              <Link
                to="/leiloes"
                className={`pb-1 text-xs font-medium border-b-2 transition-colors ${
                  location.pathname.startsWith("/leiloes")
                    ? "border-emerald-600 text-emerald-700"
                    : "border-transparent hover:text-emerald-700"
                }`}
              >
                Leilões
              </Link>
              <Link
                to="/about"
                className={`pb-1 text-xs font-medium border-b-2 transition-colors ${
                  location.pathname.startsWith("/about")
                    ? "border-emerald-600 text-emerald-700"
                    : "border-transparent hover:text-emerald-700"
                }`}
              >
                Sobre Nós
              </Link>
              <Link
                to="/contact"
                className={`pb-1 text-xs font-medium border-b-2 transition-colors ${
                  location.pathname.startsWith("/contact")
                    ? "border-emerald-600 text-emerald-700"
                    : "border-transparent hover:text-emerald-700"
                }`}
              >
                Fale Conosco
              </Link>
              {showBackButton && (
                <Button
                  variant="ghost"
                  onClick={() => navigate(-1)}
                  className="ml-4 h-7 px-2 text-[11px] font-medium text-gray-600 hover:text-emerald-700 hover:bg-emerald-50"
                >
                  <ArrowLeft className="h-3 w-3 mr-1" /> Voltar
                </Button>
              )}
            </nav>
          </div>

          {/* Linha 2: busca + ações */}
          <div className="flex items-center gap-4">
            {/* Barra de busca central */}
            <div className="flex-1">
              <div className="flex items-center bg-white rounded-full shadow-sm border border-gray-100 px-4 py-2">
                <Input
                  type="text"
                  placeholder="O que você está procurando?"
                  className="border-0 shadow-none focus-visible:ring-0 text-xs text-gray-700 placeholder:text-gray-400 px-0"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
                <Search className="h-4 w-4 text-emerald-500" />
              </div>
            </div>

            {/* Ações à direita: cadastro / login */}
            <div className="flex items-center gap-3">
              {loading ? (
                <div className="h-10 w-20 bg-gray-200 animate-pulse rounded-md" />
              ) : user ? (
                <>
                  <Button
                    onClick={() => navigate("/my-data/registration")}
                    className="h-10 px-5 rounded-full bg-emerald-600 hover:bg-emerald-700 text-[11px] font-semibold text-white flex items-center"
                  >
                    MEUS DADOS
                  </Button>
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="text-[11px] font-medium text-gray-700 hover:text-emerald-700 flex items-center h-10"
                  >
                    SAIR
                  </button>
                </>
              ) : (
                <>
                  <Button
                    onClick={() => navigate("/register")}
                    className="h-10 px-5 rounded-full bg-slate-900 hover:bg-slate-950 text-[11px] font-semibold text-white flex items-center"
                  >
                    CADASTRE-SE
                  </Button>
                  <button
                    type="button"
                    onClick={() => navigate("/login")}
                    className="text-[11px] font-medium text-gray-700 hover:text-emerald-700 flex items-center h-10"
                  >
                    LOGIN
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;