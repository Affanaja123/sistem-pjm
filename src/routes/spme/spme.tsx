import React, { useState, useEffect } from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api').replace(/\/api$/, '');

export const Route = createFileRoute('/spme/spme')({
  component: SpmePage,
});

function SpmePage() {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    // Mengambil data dari backend yang sudah kita buat
    fetch(`${API_BASE_URL}/api/get_spme.php`)
      .then(res => res.json())
      .then(res => {
        if (res.status === 'success') setData(res.data);
      })
      .catch(err => console.error("Gagal memuat data SPME:", err));
  }, []);

  if (!data) return <div className="min-h-screen flex items-center justify-center">Memuat...</div>;

  return (
    <div className="flex flex-col min-h-screen bg-gray-100">
      <Header />

      <main className="flex-grow">
        {/* Hero Section - Dinamis */}
        <div className="relative w-full h-[400px] flex items-center justify-center overflow-hidden">
          <img
            src={data.bg_image ? `${API_BASE_URL}/uploads/${data.bg_image}` : '/images/campus_bg.jpg'}
            alt="Background SPME"
            className="absolute inset-0 w-full h-full object-cover object-top"
          />
          <div className="absolute inset-0 bg-black/50" />

          <div className="relative z-10 text-center px-4">
            <h1 className="text-4xl md:text-6xl font-bold text-white tracking-wide uppercase">
              {data.title || "SPME"}
            </h1>
            <p className="mt-4 text-lg text-white/90 font-medium">
              {data.subtitle || "Sistem Penjaminan Mutu Eksternal"}
            </p>
          </div>
        </div>

        {/* Content Area */}
        <div className="p-8 max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-slate-800 mb-4">Tentang SPME</h2>
          <p className="text-slate-600 leading-relaxed text-justify">
            Sistem Penjaminan Mutu Eksternal (SPME) adalah kegiatan penilaian melalui
            akreditasi untuk menentukan kelayakan dan tingkat pencapaian mutu program studi
            dan perguruan tinggi. Melalui SPME, kami memastikan bahwa standar pendidikan
            yang diberikan telah memenuhi kriteria yang ditetapkan oleh BAN-PT maupun LAM.
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
}