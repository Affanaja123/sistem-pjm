import React, { useState } from 'react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { createFileRoute } from '@tanstack/react-router';
import heroBg from '/src/assets/ipti1.jpg';

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api').replace(/\/api$/, '');

export const Route = createFileRoute('/tentang/tupoksi')({
    loader: async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/api/get_tupoksi.php`);
            return await res.json();
        } catch (e) {
            return { status: 'error', data: null };
        }
    },
    component: TupoksiPage,
});

function TupoksiPage() {
    const loaderData = Route.useLoaderData();
    
    // State dengan Lazy Initializer yang aman
    const [data, setData] = useState(() => {
        // Jika loader sukses, ambil data
        if (loaderData?.status === 'success' && loaderData.data) {
            localStorage.setItem('tupoksi_cache', JSON.stringify(loaderData.data));
            return loaderData.data;
        }
        // Jika gagal, coba ambil dari cache
        const cached = localStorage.getItem('tupoksi_cache');
        return cached ? JSON.parse(cached) : { 
            title: "TUGAS POKOK DAN FUNGSI", 
            subtitle: "PENJAMINAN MUTU - INSTITUT PARIWISATA TEDJA INDONESIA", 
            tugas_pokok: "", 
            fungsi: "", 
            bg_url: null 
        };
    });

    return (
        <div className="min-h-screen bg-gray-100 text-black">
            <Header />

            {/* Hero Section */}
            <section className="relative h-[400px] w-full overflow-hidden flex items-center justify-center">
                <img 
                    src={data.bg_url || heroBg} 
                    alt="Background Kampus" 
                    className="absolute w-full h-full object-cover object-top" 
                />
                <div className="absolute inset-0 bg-black/50" />

                <div className="relative z-10 text-center text-white px-4">
                    <h1 className="text-3xl md:text-5xl font-bold tracking-tight">{data.title}</h1>
                    <h2 className="text-xl md:text-2xl font-light mt-2">{data.subtitle}</h2>
                </div>
            </section>

            <main className="max-w-4xl mx-auto px-6 py-16">
                {/* TUGAS POKOK */}
                <section className="mb-24 text-center">
                    <h2 className="text-3xl font-bold text-gray-900 tracking-widest uppercase mb-10">Tugas Pokok</h2>
                    <div className="max-w-3xl mx-auto border-l-4 border-gray-900 pl-8 text-left">
                        <p className="text-gray-800 leading-relaxed text-lg text-justify font-light">
                            {data.tugas_pokok || "Data tugas pokok belum tersedia."}
                        </p>
                    </div>
                </section>

                {/* FUNGSI */}
                <section>
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold text-gray-900 tracking-widest uppercase">Fungsi</h2>
                        <div className="w-16 h-px bg-gray-300 mx-auto mt-6"></div>
                    </div>
                    
                    <div className="space-y-12">
                        {data.fungsi && data.fungsi.split('\n').filter((f: string) => f.trim() !== "").map((item: string, index: number) => (
                            <div key={index} className="flex gap-8 items-start border-b border-gray-100 pb-12 last:border-0 last:pb-0">
                                <span className="text-gray-400 font-mono text-xl pt-1">
                                    {String(index + 1).padStart(2, '0')}
                                </span>
                                <p className="text-gray-600 leading-relaxed text-lg text-justify font-light">
                                    {item}
                                </p>
                            </div>
                        ))}
                    </div>
                </section>
            </main>

            <Footer />
        </div>
    );
}