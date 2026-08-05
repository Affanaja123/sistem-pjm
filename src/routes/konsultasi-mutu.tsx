import { createFileRoute } from '@tanstack/react-router';
import React, { useState, useEffect } from 'react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api').replace(/\/api$/, '');

export const Route = createFileRoute('/konsultasi-mutu')({
  component: KonsultasiPage,
});

function KonsultasiPage() {
  const [data, setData] = useState({
    title: "Memuat...",
    subtitle: "Memuat...",
    bgImage: null as string | null,
  });

  useEffect(() => {
    // Sesuaikan endpoint backend Node.js Anda untuk konsultasi mutu
    fetch(`${API_BASE_URL}/api/konsultasi-mutu`)
      .then(res => res.json())
      .then(res => {
        const resultData = res.data || res;
        if (resultData) {
          const finalImageUrl = resultData.bg_url || 
            (resultData.bg_image ? `${API_BASE_URL}/uploads/${resultData.bg_image}` : null) ||
            (resultData.image_path ? `${API_BASE_URL}/uploads/${resultData.image_path}` : null) ||
            resultData.image_url;

          setData({
            title: resultData.title || resultData.judul || "Konsultasi Mutu",
            subtitle: resultData.subtitle || resultData.deskripsi || "Layanan konsultasi penjaminan mutu terpadu.",
            bgImage: finalImageUrl,
          });
        }
      })
      .catch(err => console.error("Gagal memuat data konsultasi:", err));
  }, []);

  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <main className="flex-grow">
        {/* Hero Section */}
        <div className="relative w-full h-[400px] flex items-center justify-center overflow-hidden bg-slate-900">
          {data.bgImage && (
            <img
              src={data.bgImage}
              alt="Background Konsultasi"
              className="absolute inset-0 w-full h-full object-cover object-center"
            />
          )}
          <div className="absolute inset-0 bg-black/40" />

          <div className="relative z-10 text-center px-4 max-w-3xl">
            <h1 className="text-3xl md:text-5xl font-bold text-white tracking-wide uppercase drop-shadow-md">
              {data.title}
            </h1>
            <p className="mt-4 text-base md:text-lg text-white/95 font-medium max-w-2xl mx-auto drop-shadow">
              {data.subtitle}
            </p>
          </div>
        </div>

        {/* Konten Halaman */}
        <div className="p-8 max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-slate-800 mb-4">Tentang Layanan</h2>
          <div className="text-slate-600 leading-relaxed text-justify space-y-4">
            <p>{data.subtitle}</p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}