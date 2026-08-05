import React, { useState, useEffect } from 'react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { createFileRoute } from '@tanstack/react-router';

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api').replace(/\/api$/, '');

export const Route = createFileRoute('/tentang/sambutan-rektor')({
    component: SambutanRektor,
});

function SambutanRektor() {
    const [sambutan, setSambutan] = useState({
        title: "",
        subtitle: "",
        nama_rektor: "",
        gelar_rektor: "",
        isi_sambutan: "",
        foto_url: "",
        bg_url: ""
    });

    useEffect(() => {
        fetch(`${API_BASE_URL}/api/get_sambutan.php`)
            .then(res => res.json())
            .then(res => {
                if (res.status === 'success') {
                    setSambutan(res.data);
                }
            })
            .catch(err => console.error("Error fetching data:", err));
    }, []);

    return (
        <div className="min-h-screen bg-gray-100">
            <Header />

            {/* Hero Section dinamis */}
            <section className="relative h-[400px] w-full overflow-hidden flex items-center justify-center">
                {/* Background Image dari database */}
                <img
                    src={sambutan.bg_url}
                    alt="Background"
                    className="absolute w-full h-full object-cover object-top"
                />
                <div className="absolute inset-0 bg-black/60" />

                <div className="relative max-w-7xl mx-auto px-4 w-full flex flex-col md:flex-row items-center gap-10 text-white">
                    {/* Foto Rektor - Tanpa bingkai */}
                    <div className="w-64 h-64 md:w-80 md:h-80 overflow-hidden flex-shrink-0">
                        {sambutan.foto_url && (
                            <img src={sambutan.foto_url} alt="Rektor" className="w-full h-full object-cover object-top" />
                        )}
                    </div>

                    {/* Teks dari database */}
                    <div className="flex-1">
                        <h1 className="text-4xl md:text-6xl font-bold tracking-tight">{sambutan.title}</h1>
                        <h2 className="text-xl md:text-3xl font-light mt-2">{sambutan.subtitle}</h2>
                        <p className="mt-6 text-xl font-semibold border-t border-white/30 pt-4">
                            {sambutan.nama_rektor}, {sambutan.gelar_rektor}
                        </p>
                    </div>
                </div>
            </section>

            {/* Konten Sambutan */}
            <main className="max-w-4xl mx-auto px-4 py-16">
                <div className="prose prose-lg text-gray-700 leading-relaxed space-y-6 text-justify">
                    {sambutan.isi_sambutan && sambutan.isi_sambutan.split('\n').map((p, i) => (
                        <p key={i}>{p}</p>
                    ))}
                </div>
            </main>
            <Footer />
        </div>
    );
}