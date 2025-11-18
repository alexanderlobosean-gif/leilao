import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import Header from "@/components/Header"; // Adicionando Header para consistência
import Footer from "@/components/Footer"; // Importando o novo componente Footer

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname,
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex flex-col bg-gray-100">
      <Header />
      <div className="flex-grow flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-4">404</h1>
          <p className="text-xl text-gray-600 mb-4">Oops! Página não encontrada</p>
          <a href="/" className="text-blue-500 hover:text-blue-700 underline">
            Retornar à Página Inicial
          </a>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default NotFound;