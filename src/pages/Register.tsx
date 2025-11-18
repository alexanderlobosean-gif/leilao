import React from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer"; // Importando o novo componente Footer
import RegisterForm from "@/components/RegisterForm";

const Register = () => {
  return (
    <div className="min-h-screen bg-gray-50 text-gray-800 flex flex-col">
      <Header />
      <main className="flex-grow flex items-center justify-center p-6">
        <RegisterForm />
      </main>
      <Footer />
    </div>
  );
};

export default Register;