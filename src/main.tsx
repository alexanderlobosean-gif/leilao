import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./globals.css";
import { AuthProvider } from "./context/AuthContext.tsx"; // Importando AuthProvider
import { BrowserRouter } from "react-router-dom"; // Importando BrowserRouter

createRoot(document.getElementById("root")!).render(
  <BrowserRouter> {/* Adicionando BrowserRouter aqui para que useNavigate funcione em AuthProvider */}
    <AuthProvider>
      <App />
    </AuthProvider>
  </BrowserRouter>
);