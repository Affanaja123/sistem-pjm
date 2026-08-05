import React, { useState, useEffect } from 'react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { createFileRoute } from '@tanstack/react-router';
import { Download, ExternalLink, FileText } from "lucide-react";
import heroBgFallback from '/src/assets/ipti1.jpg'; // Pastikan path ini benar

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api').replace(/\/api$/, '');

export const Route = createFileRoute('/evaluasi/instrumen')({
    loader: async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/api/get_evaluasi.php`);
            return await res.json();
        } catch (e) { return null; }
    },
    component: InstrumenEvaluasiPage,
});

function InstrumenEvaluasiPage() {
    const loaderData = Route.useLoaderData();
    // Inisialisasi state dengan nilai default jika data belum ada
    const [data, setData] = useState(loaderData?.status === 'success' ? loaderData.data : {
        title: "INSTRUMEN EVALUASI",
        subtitle: "Pusat Data Instrumen Evaluasi",
        bg_url: null,
        categories: {}
    });

    useEffect(() => {
        if (loaderData?.status === 'success') setData(loaderData.data);
    }, [loaderData]);

    const tabOrder = ["Instrumen AMI", "Instrumen Survei", "Instrumen Asesmen"];
    const categories = tabOrder.filter(tab => data.categories && data.categories.hasOwnProperty(tab));

    const [activeTab, setActiveTab] = useState(tabOrder[0]);
    const [showAll, setShowAll] = useState(false);

    const items = data.categories[activeTab] || [];
    const displayedItems = showAll ? items : items.slice(0, 3);

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col">
            <Header />

            {/* Header Section dengan Background dan Subtitle Dinamis */}
            <section className="relative h-[250px] md:h-[400px] w-full overflow-hidden flex items-center justify-center text-center">
                <img
                    src={
                        data.bg_image
                            ? `${API_BASE_URL}/uploads/${data.bg_image}`
                            : heroBgFallback
                    }
                    alt="Background Pustaka"
                    className="absolute w-full h-full object-cover object-top"
                    onError={(e) => {
                        console.error("Gagal memuat gambar dari server, beralih ke fallback");
                        e.currentTarget.src = heroBgFallback;
                    }}
                />
                <div className="absolute inset-0 bg-black/50" />

                <div className="relative z-10 px-4">
                    <h1 className="text-3xl md:text-5xl font-bold text-white tracking-tight uppercase mb-2">
                        {data.title || "INSTRUMEN EVALUASI"}
                    </h1>
                    {data.subtitle && (
                        <p className="text-sm md:text-xl text-white/90 font-light">
                            {data.subtitle}
                        </p>
                    )}
                </div>
            </section>

            <main className="flex-grow max-w-6xl mx-auto px-4 md:px-6 py-10 md:py-16 w-full">
                {/* Tab Kategori */}
                <div className="flex overflow-x-auto gap-2 mb-10 pb-2 scrollbar-hide">
                    {categories.map((tab) => (
                        <button
                            key={tab}
                            onClick={() => { setActiveTab(tab); setShowAll(false); }}
                            className={`flex-shrink-0 px-6 py-3 rounded-lg text-sm font-bold uppercase transition-all whitespace-nowrap ${activeTab === tab
                                ? 'bg-[#367fa9] text-white shadow-md'
                                : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
                                }`}
                        >
                            {tab}
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
                            <h3 className="font-bold text-gray-800 text-sm md:text-lg leading-snug min-h-[3rem] mb-4">
                                {item.title}
                            </h3>
                            <a
                                href={item.type === 'file'
                                    ? `${API_BASE_URL}/api/download.php?file=${item.value}`
                                    : item.value}
                                target={item.type === 'file' ? "_self" : "_blank"} // _self untuk download, _blank untuk link baru
                                rel={item.type === 'file' ? undefined : "noopener noreferrer"}
                                className="inline-flex items-center gap-2 text-[#367fa9] font-bold text-xs md:text-sm hover:underline"
                            >
                                {item.type === 'file' ? <><Download size={16} /> Unduh Dokumen</> : <><ExternalLink size={16} /> Buka Link</>}
                            </a>
                        </div>
                    ))}
                </div>

                {items.length > 3 && (
                    <div className="text-center mt-10 md:mt-16">
                        <button
                            onClick={() => setShowAll(!showAll)}
                            className="px-6 py-2 border border-gray-300 rounded-full text-gray-600 font-medium hover:bg-gray-100 transition-all text-sm"
                        >
                            {showAll ? "Tampilkan Lebih Sedikit" : "Selengkapnya"}
                        </button>
                    </div>
                )}
            </main>
            <Footer />
        </div>
    );
}