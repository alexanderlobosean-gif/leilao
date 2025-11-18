import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import ChatWidget from "@/components/ChatWidget";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import LotDetail from "./pages/LotDetail";
import About from "./pages/About";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Contact from "./pages/Contact";
import HowTo from "./pages/HowTo";
import ProtectedRoute from "./components/ProtectedRoute";
import MyDataLayout from "./components/MyDataLayout";
import MyRegistration from "./pages/MyRegistration";
import MyBids from "./pages/MyBids";
import MyQualifications from "./pages/MyQualifications";
import Documents from "./pages/Documents";
import AdminLayout from "@/components/admin/AdminLayout"; // Usando alias @/
import AdminDashboard from "@/pages/admin/AdminDashboard"; // Usando alias @/
import ManageLots from "@/pages/admin/ManageLots"; // Usando alias @/
import ManageUsers from "@/pages/admin/ManageUsers";
import ManageDocuments from "@/pages/admin/ManageDocuments";
import Leiloes from "@/pages/Leiloes"; // Importando o componente Leiloes

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/lot/:id" element={<LotDetail />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/how-to" element={<HowTo />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/leiloes" element={<Leiloes />} />

        {/* Rotas protegidas para Meus Dados */}
        <Route path="/my-data" element={<ProtectedRoute />}>
          <Route element={<MyDataLayout />}>
            <Route index element={<MyRegistration />} />
            <Route path="registration" element={<MyRegistration />} />
            <Route path="bids" element={<MyBids />} />
            <Route path="qualifications" element={<MyQualifications />} />
            <Route path="documents" element={<Documents />} />
          </Route>
        </Route>

        {/* Rotas protegidas para a Área Administrativa */}
        <Route element={<ProtectedRoute />}>
          <Route path="/admin" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="lots" element={<ManageLots />} />
            <Route path="users" element={<ManageUsers />} />
            <Route path="documents" element={<ManageDocuments />} />
            {/* Adicione mais rotas administrativas aqui */}
          </Route>
        </Route>

        {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
        <Route path="*" element={<NotFound />} />
      </Routes>
      <ChatWidget />
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;