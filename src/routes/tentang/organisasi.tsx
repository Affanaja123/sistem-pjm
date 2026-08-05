import React, { useState, useEffect } from 'react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { createFileRoute } from '@tanstack/react-router';

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api').replace(/\/api$/, '');

export const Route = createFileRoute('/tentang/organisasi')({
  component: StrukturOrganisasiPage,
});

function StrukturOrganisasiPage() {
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/get_organisasi.php`)
      .then(res => res.json())
      .then(res => {
        if (res.status === 'success') setData(res.data);
      });
  }, []);

  if (!data) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  return (
    <div className="min-h-screen bg-gray-100 text-black">
      <Header />

      {/* Hero Section - Dinamis dari Admin */}
      <section className="relative h-[300px] md:h-[400px] w-full overflow-hidden flex items-center justify-center">
        <img 
          src={data.bg_image ? `${API_BASE_URL}/uploads/${data.bg_image}` : '/path/to/fallback.jpg'} 
          alt="Background Kampus" 
          className="absolute inset-0 w-full h-full object-cover object-top" 
        />
        <div className="absolute inset-0 bg-black/50" />
        
        <div className="relative z-10 text-center text-white px-4">
          <h1 className="text-2xl md:text-5xl font-bold tracking-tight uppercase">{data.title}</h1>
          <h2 className="text-sm md:text-2xl font-light mt-2 uppercase tracking-wide">
            {data.subtitle}
          </h2>
        </div>
      </section>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 md:px-6 py-12 md:py-16">
        <div className="text-center mb-8 md:mb-12">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 tracking-widest uppercase">Bagan Organisasi</h2>
            <div className="w-16 h-px bg-gray-300 mx-auto mt-4 md:mt-6"></div>
        </div>

        {/* Kontainer Gambar Struktur - Dinamis dari Admin */}
        <div className="w-full bg-white p-3 md:p-8 border border-gray-100 rounded-xl shadow-sm overflow-x-auto">
            <div className="min-w-[800px] md:min-w-full">
              {data.org_image ? (
                <img
                    src={`${API_BASE_URL}/uploads/${data.org_image}`}
                    alt="Struktur Organisasi IPTI"
                    className="w-full h-auto object-contain"
                />
              ) : (
                <p className="text-center text-gray-400 py-10">Gambar struktur belum diatur.</p>
              )}
            </div>
        </div>

        <p className="md:hidden mt-4 text-center text-sm text-gray-500 italic">
            Geser ke samping untuk melihat bagan secara detail
        </p>
      </main>

      <Footer />
    </div>
  );
}