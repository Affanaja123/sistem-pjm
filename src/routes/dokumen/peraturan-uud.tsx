import React, { useState } from 'react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { createFileRoute } from '@tanstack/react-router';
import heroBg from '/src/assets/ipti1.jpg';

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api').replace(/\/api$/, '');

export const Route = createFileRoute('/dokumen/peraturan-uud')({
    loader: async () => {
        try {
            const res = await fetch(`${API_BASE_URL}/api/get_peraturan.php`);
            return await res.json();
        } catch (e) { return null; }
    },
    component: PeraturanPage,
});

function PeraturanPage() {
    const loaderData = Route.useLoaderData();
    const [openSection, setOpenSection] = useState<string | null>('Undang-Undang');

    // Mengambil data dari API atau LocalStorage Cache
    const [data, setData] = useState(() => {
        if (loaderData?.status === 'success') {
            localStorage.setItem('peraturan_cache', JSON.stringify(loaderData.data));
            return loaderData.data;
        }
        const cached = localStorage.getItem('peraturan_cache');
        return cached ? JSON.parse(cached) : { 
            title: "PERATURAN PERUNDANG-UNDANGAN", 
            subtitle: "Pusat Jaminan Mutu", 
            bg_url: null, 
            documents: [] 
        };
    });

    return (
        <div className="min-h-screen bg-gray-100 text-gray-900">
            <Header />

            {/* Hero Section */}
            <section className="relative h-[400px] w-full overflow-hidden flex items-center justify-center">
                <img src={data.bg_url || heroBg} alt="Background Kampus" className="absolute w-full h-full object-cover object-top" />
                <div className="absolute inset-0 bg-black/50" />
                <div className="relative z-10 text-center text-white px-4">
                    <h1 className="text-3xl md:text-5xl font-bold tracking-tight">{data.title}</h1>
                    <h2 className="text-xl md:text-2xl font-light mt-2 uppercase tracking-wide">{data.subtitle}</h2>
                </div>
            </section>

            <main className="max-w-4xl mx-auto px-6 py-16">
                <div className="space-y-4">
                    {data.documents.map((section: any) => (
                        <div
                            key={section.name}
                            className={`bg-white rounded-lg border transition-all duration-300 ${
                                openSection === section.name
                                    ? 'border-[#367fa9] shadow-sm'
                                    : 'border-[#367fa9]/30 hover:border-[#367fa9]'
                            }`}
                        >
                            <button
                                onClick={() => setOpenSection(openSection === section.name ? null : section.name)}
                                className="w-full flex justify-between items-center p-8 text-left"
                            >
                                <div className="flex items-center gap-6">
                                    <div className={`w-1 h-8 rounded-full ${openSection === section.name ? 'bg-[#367fa9]' : 'bg-[#367fa9]/30'}`} />
                                    <div>
                                        <span className="block text-lg font-bold text-gray-900 uppercase tracking-widest">{section.name}</span>
                                        <p className="text-sm text-gray-500 mt-1 font-light">{section.description}</p>
                                    </div>
                                </div>

                                <svg
                                    className={`w-5 h-5 text-[#367fa9] transform transition-transform duration-300 ${openSection === section.name ? 'rotate-180' : ''}`}
                                    fill="none" stroke="currentColor" viewBox="0 0 24 24"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                </svg>
                            </button>

                            {openSection === section.name && (
                                <div className="px-8 pb-8">
                                    <div className="pt-4 border-t border-[#367fa9]/20 grid gap-2">
                                        {section.links.map((link: any, idx: number) => (
                                            <a
                                                key={idx}
                                                href={link.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center gap-3 p-3 text-gray-600 hover:text-[#367fa9] hover:bg-sky-50 rounded transition-all font-medium text-sm"
                                            >
                                                <span className="text-[#367fa9]/50 text-xs">●</span>
                                                {link.label}
                                            </a>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </main>

            <Footer />
        </div>
    );
}