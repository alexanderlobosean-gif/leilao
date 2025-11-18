"use client";

import React, { useEffect, useState } from "react";

const slides = [
  {
    id: 1,
    image: "https://images.pexels.com/photos/210019/pexels-photo-210019.jpeg?auto=compress&cs=tinysrgb&w=1600",
    alt: "Leilão de carros e utilitários",
  },
  {
    id: 2,
    image: "https://images.pexels.com/photos/2199293/pexels-photo-2199293.jpeg?auto=compress&cs=tinysrgb&w=1600",
    alt: "Leilão de caminhões",
  },
  {
    id: 3,
    image: "https://mobilidade.estadao.com.br/wp-content/uploads/2020/09/mobilidade_0809-1.jpg",
    alt: "Leilão de motos",
  },
];

const AUTO_PLAY_INTERVAL = 6000; // 6s

const HeroBannerSlider: React.FC = () => {
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, AUTO_PLAY_INTERVAL);

    return () => clearInterval(timer);
  }, []);

  if (!slides.length) return null;

  return (
    <div className="relative w-full h-52 md:h-72 rounded-2xl overflow-hidden bg-gray-200">
      {/* Imagens */}
      {slides.map((slide, index) => (
        <img
          key={slide.id}
          src={slide.image}
          alt={slide.alt}
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-700 ${
            index === current ? "opacity-100" : "opacity-0"
          }`}
        />
      ))}

      {/* Gradiente sutil para leitura de texto, se quiser adicionar algo depois */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-r from-black/20 via-transparent to-black/10" />

      {/* Controles: bolinhas */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
        {slides.map((slide, index) => (
          <button
            key={slide.id}
            type="button"
            onClick={() => setCurrent(index)}
            className={`h-1.5 w-4 rounded-full transition-colors ${
              index === current ? "bg-white" : "bg-white/40"
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default HeroBannerSlider;
