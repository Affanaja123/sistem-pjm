import React, { useState, useEffect } from 'react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { createFileRoute } from '@tanstack/react-router';
import { ChevronDown, ChevronUp, FileText, ExternalLink, Download, Loader2 } from "lucide-react";
import heroBgFallback from '/src/assets/ipti1.jpg';

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api').replace(/\/api$/, '');

export const Route = createFileRoute('/dokumen/pustaka')({
    loader: async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/api/get_pustaka.php`);
            return await res.json();
        } catch (e) { return null; }
    },
    component: PustakaPage,
});

function PustakaPage() {
    const loaderData = Route.useLoaderData();
    const [data, setData] = useState(loaderData?.status === 'success' ? loaderData.data : { title: "PUSTAKA", subtitle: "Pusat Dokumentasi dan Informasi", bg_image: null, categories: {} });
    const [loading, setLoading] = useState(false);

    // Memastikan data selalu sinkron jika terjadi update
    useEffect(() => {
        if (loaderData?.status === 'success') {
            setData(loaderData.data);
        }
    }, [loaderData]);

    const categories = Object.keys(data.categories || {});
    const [activeTab, setActiveTab] = useState(categories[0] || "");
    const [showAll, setShowAll] = useState(false);

    const items = data.categories[activeTab] || [];
    const displayedItems = showAll ? items : items.slice(0, 3);

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col">
            <Header />

            {/* Header Section Responsif */}
            <section className="relative h-[250px] md:h-[400px] flex items-center justify-center text-center overflow-hidden">
                <img
                    src={
                        data.bg_image
                            ? `${API_BASE_URL}/uploads/${data.bg_image}`
                            : heroBgFallback
                    }
                    alt="Background Pustaka"
                    className="absolute w-full h-full object-cover object-top"
                    onError={(e) => {
                        console.error("Gagal memuat dari:", e.currentTarget.src);
                        e.currentTarget.src = heroBgFallback;
                    }}
                />
                <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-black/40" />
                <div className="relative z-10 px-4 max-w-4xl">
                    {/* Ukuran font disesuaikan: text-3xl di mobile, text-5xl di desktop */}
                    <h1 className="text-3xl md:text-5xl font-extrabold text-white tracking-widest uppercase mb-2 md:mb-4 drop-shadow-lg">
                        {data.title || "PUSTAKA"}
                    </h1>
                    <p className="text-sm md:text-xl text-white/90 font-light drop-shadow-md">
                        {data.subtitle || "Pusat Dokumentasi dan Informasi"}
                    </p>
                </div>
            </section>

            <main className="flex-grow max-w-6xl mx-auto px-4 md:px-6 py-8 md:py-16 w-full">
                {/* Tab Kategori Responsif */}
                <div className="flex flex-row overflow-x-auto gap-2 mb-8 md:mb-12 pb-2 scrollbar-hide">
                    {categories.map((tab) => (
                        <button
                            key={tab}
                            onClick={() => { setActiveTab(tab); setShowAll(false); }}
                            className={`px-5 py-2 md:px-8 md:py-3 rounded-lg font-semibold text-sm md:text-base whitespace-nowrap transition-all ${activeTab === tab
                                ? 'bg-[#367fa9] text-white shadow-md'
                                : 'bg-white text-gray-600 border border-gray-200'
                                }`}
                        >
                            {tab.toUpperCase()}
                        </button>
                    ))}
                </div>

                {/* Grid Konten */}
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 md:gap-8">
                    {displayedItems.map((item: any, index: number) => (
                        <div key={index} className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm hover:shadow-lg transition-all duration-300">
                            <div className="w-12 h-12 bg-[#367fa9]/10 rounded-full flex items-center justify-center mb-4 text-[#367fa9]">
                                <FileText size={24} />
                            </div>
                            <h3 className="font-bold text-gray-800 text-base md:text-lg leading-snug min-h-[3rem] mb-4">
                                {item.title || "Dokumen Tanpa Judul"}
                            </h3>

                            {/* Logika membedakan Link dan File */}
                            {item.type === 'url' ? (
                                <a
                                    href={item.value}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-2 text-[#367fa9] font-bold text-sm hover:underline"
                                >
                                    <ExternalLink size={16} /> Buka Link
                                </a>
                            ) : (
                                <a
                                    href={`${API_BASE_URL}/api/download.php?file=${encodeURIComponent(item.value)}`}
                                    className="inline-flex items-center gap-2 text-[#367fa9] font-bold text-sm hover:underline"
                                >
                                    <Download size={16} /> Unduh Dokumen
                                </a>
                            )}
                        </div>
                    ))}
                </div>

                {/* Tombol Selengkapnya */}
                {items.length > 3 && (
                    <div className="text-center mt-10 md:mt-16">
                        <button
                            onClick={() => setShowAll(!showAll)}
                            className="inline-flex items-center gap-2 bg-white px-6 py-3 rounded-full border border-gray-300 font-semibold text-gray-700 text-sm md:text-base hover:bg-gray-50 shadow-sm"
                        >
                            {showAll ? <>Lebih Sedikit <ChevronUp size={18} /></> : <>Selengkapnya <ChevronDown size={18} /></>}
                        </button>
                    </div>
                )}
            </main>
            <Footer />
        </div>
    );

}