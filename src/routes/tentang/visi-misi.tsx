import React, { useState, useEffect } from 'react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { createFileRoute } from '@tanstack/react-router';
import heroBg from '/src/assets/ipti1.jpg';

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api').replace(/\/api$/, '');

// 1. Definisikan Loader untuk memuat data sebelum navigasi selesai
export const Route = createFileRoute('/tentang/visi-misi')({
    loader: async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/api/get_visi_misi.php`);
            return await res.json();
        } catch (e) {
            return null;
        }
    },
    component: VisiMisiPage,
});

function VisiMisiPage() {
    const loaderData = Route.useLoaderData();
    
    // 2. State awal mengambil dari Loader, jika tidak ada baru ambil dari LocalStorage
    const [data, setData] = useState(() => {
        if (loaderData?.status === 'success') {
            localStorage.setItem('visi_misi_cache', JSON.stringify(loaderData.data));
            return loaderData.data;
        }
        const cached = localStorage.getItem('visi_misi_cache');
        return cached ? JSON.parse(cached) : { title: "VISI & MISI", subtitle: "...", visi: "", misi: "", bg_url: "" };
    });

    return (
        <div className="min-h-screen bg-gray-100 font-sans text-gray-900">
            <Header />

            <section className="relative h-[400px] w-full overflow-hidden flex items-center justify-center">
                <img 
                    // Gambar akan langsung muncul dari cache, tanpa flicker ke heroBg
                    src={data.bg_url || heroBg} 
                    alt="Background" 
                    className="absolute w-full h-full object-cover object-top" 
                />
                <div className="absolute inset-0 bg-black/50" />

                <div className="relative z-10 text-center text-white px-4">
                    <h1 className="text-3xl md:text-5xl font-bold tracking-tight">{data.title}</h1>
                    <h2 className="text-xl md:text-2xl font-light mt-2">{data.subtitle}</h2>
                </div>
            </section>

            <main className="max-w-4xl mx-auto px-6 py-16">
                <section className="mb-24 text-center">
                    <h2 className="text-3xl font-bold text-gray-900 tracking-widest uppercase mb-10">Visi</h2>
                    <div className="max-w-3xl mx-auto">
                        <p className="text-2xl text-gray-800 leading-relaxed font-light italic">"{data.visi}"</p>
                    </div>
                </section>

                <section>
                    <div className="text-center mb-20">
                        <h2 className="text-2xl font-bold text-gray-900 tracking-widest uppercase">Mi</h2>
                        <div className="w-16 h-px bg-gray-300 mx-auto mt-6"></div>
                    </div>
                    <div className="space-y-12">
                        {data.misi && data.misi.split('\n').map((misi: string, index: number) => (
                            <div key={index} className="flex gap-8 items-start border-b border-gray-200 pb-12 last:border-0">
                                <span className="text-gray-400 font-mono text-xl pt-1">
                                    {String(index + 1).padStart(2, '0')}
                                </span>
                                <p className="text-gray-600 leading-relaxed text-lg text-justify font-light">{misi}</p>
                            </div>
                        ))}
                    </div>
                </section>
            </main>
            <Footer />
        </div>
    );
}