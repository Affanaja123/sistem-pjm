import React, { useState, useEffect } from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';

// Pastikan base URL sesuai dengan backend Anda
const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api').replace(/\/api$/, '');

export const Route = createFileRoute('/pelaporan')({
  component: PelaporanPage,
});

function PelaporanPage() {
  const [data, setData] = useState({
    title: "Memuat...",
    subtitle: "Memuat...",
    bgImage: null as string | null,
  });

  useEffect(() => {
    // PERBAIKAN: Gunakan rute modul dinamis backend Node.js
    fetch(`${API_BASE_URL}/api/pelaporan`)
      .then(res => res.json())
      .then(res => {
        const resultData = res.data || res;
        if (resultData) {
          setData({
            title: resultData.title || resultData.judul || "Dashboard & Pelaporan",
            subtitle: resultData.subtitle || resultData.deskripsi || "Akses data penjaminan mutu secara real-time dan transparan.",
            // Mendukung berbagai macam nama field gambar yang mungkin tersimpan di database
            bgImage: resultData.image_path || resultData.bg_image || resultData.image || null,
          });
        }
      })
      .catch(err => console.error("Gagal memuat data:", err));
  }, []);

  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <main className="flex-grow">
        <div className="relative w-full h-[400px] flex items-center justify-center overflow-hidden">
          {/* Perbaikan: Menggabungkan base URL dengan nama file dari database */}
          {data.bgImage && (
            <img
              src={`${API_BASE_URL}/uploads/${data.bgImage}`}
              alt="Background Pelaporan"
              className="absolute inset-0 w-full h-full object-cover object-top"
              onError={(e) => {
                // Ini membantu jika gambar belum ada atau salah path
                console.error("Gagal memuat gambar:", e);
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
          )}
          <div className="absolute inset-0 bg-black/50" />

          <div className="relative z-10 text-center px-4">
            <h1 className="text-4xl md:text-6xl font-bold text-white tracking-wide uppercase">
              {data.title}
            </h1>
            <p className="mt-4 text-lg text-white/90 font-medium max-w-2xl mx-auto">
              {data.subtitle}
            </p>
          </div>
        </div>

        <div className="p-8 max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-slate-800 mb-4">Tentang Pelaporan</h2>
          <div className="text-slate-600 leading-relaxed text-justify space-y-4">
            <p>
              Halaman Pelaporan ini dirancang untuk memberikan akses dan visibilitas
              terhadap data metrik penjaminan mutu secara real-time dan transparan.
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}