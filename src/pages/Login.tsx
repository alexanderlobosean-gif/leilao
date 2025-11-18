import React from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer"; // Importando o novo componente Footer
import LoginForm from "@/components/LoginForm";

const Login = () => {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 flex flex-col">
      <Header />
      <main className="flex-grow flex items-center justify-center p-6">
        <LoginForm />
      </main>
      <Footer />
    </div>
  );
};

export default Login;