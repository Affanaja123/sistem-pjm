import React, { useState, useEffect, useRef } from 'react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Link, createFileRoute } from '@tanstack/react-router';
import heroBg from '/src/assets/ipti1.jpg';

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api').replace(/\/api$/, '');

export const Route = createFileRoute('/informasi/berita')({
    component: BeritaPage,
});

function BeritaPage() {
    const [beritaList, setBeritaList] = useState<any[]>([]);
    const carouselRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        fetch(`${API_BASE_URL}/api/get_berita.php`)
            .then(res => res.json())
            .then(res => {
                if (res.status === 'success') setBeritaList(res.data);
            });
    }, []);

    const scroll = (dir: 'left' | 'right') => {
        carouselRef.current?.scrollBy({ left: dir === 'left' ? -300 : 300, behavior: 'smooth' });
    };

    return (
        <div className="min-h-screen bg-gray-100 text-gray-800">
            <Header />

            {/* Hero Section */}
            <section className="relative h-[400px] w-full overflow-hidden flex items-center justify-center">
                <img src={heroBg} alt="Background" className="absolute w-full h-full object-cover object-top" />
                <div className="absolute inset-0 bg-black/55" />
                <div className="relative z-10 text-center px-4">
                    <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight mb-3">Informasi & Berita</h1>
                    <p className="text-xs tracking-[4px] uppercase text-white mb-3 font-medium">PJM — Institut Pariwisata Tedja Indonesia</p>

                    <div className="w-10 h-0.5 bg-white/40 mx-auto" />
                </div>
            </section>

            <main className="max-w-6xl mx-auto px-6 py-14">
                {/* Section Header */}
                <div className="flex items-center justify-between mb-7">
                    <div>
                        <p className="text-[11px] uppercase tracking-widest text-gray-400 font-semibold mb-1">Publikasi Terbaru</p>
                        <h2 className="text-xl font-bold text-gray-800">Berita Terkini</h2>
                    </div>
                    <div className="flex gap-2">
                        <button
                            onClick={() => scroll('left')}
                            className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-300 bg-white hover:bg-gray-50 transition-colors text-gray-500 hover:text-gray-700"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                            </svg>
                        </button>
                        <button
                            onClick={() => scroll('right')}
                            className="w-8 h-8 flex items-center justify-center rounded-full border border-gray-300 bg-white hover:bg-gray-50 transition-colors text-gray-500 hover:text-gray-700"
                        >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                            </svg>
                        </button>
                    </div>
                </div>

                {/* Carousel */}
                <div
                    ref={carouselRef}
                    className="flex gap-4 overflow-x-auto pb-4 snap-x"
                    style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
                >
                    {beritaList.length === 0 && (
                        <p className="text-sm text-gray-400 py-10 w-full text-center">Belum ada berita.</p>
                    )}
                    {beritaList.map((berita) => (
                        <div key={berita.id} className="min-w-[280px] max-w-[280px] snap-start flex-shrink-0">
                            <Link
                                to="/informasi/detail-berita"
                                search={{ id: berita.id }}
                                className="group bg-white rounded-xl border border-gray-200 block h-full overflow-hidden transition-shadow duration-300 hover:shadow-md"
                            >
                                {/* Thumbnail */}
                                <div className="w-full h-[160px] overflow-hidden bg-gray-100">
                                    {berita.thumbnail ? (
                                        <img
                                            src={`${API_BASE_URL}/uploads/${berita.thumbnail}`}
                                            alt={berita.judul}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-gray-100">
                                            <svg className="w-8 h-8 text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path d="M4 16l4-4 4 4 4-6 4 6" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
                                            </svg>
                                        </div>
                                    )}
                                </div>

                                {/* Konten */}
                                <div className="p-4">
                                    <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wider mb-2">{berita.tanggal}</p>
                                    <h3 className="text-sm font-semibold text-gray-800 leading-snug line-clamp-2 mb-2 group-hover:text-gray-600 transition-colors">
                                        {berita.judul}
                                    </h3>
                                    <p className="text-xs text-gray-400 leading-relaxed line-clamp-2">
                                        {berita.ringkasan}
                                    </p>
                                    <div className="mt-3 flex items-center gap-1 text-[11px] text-gray-500 font-medium cursor-pointer hover:text-blue-600 transition-colors duration-200">
                                        <span>Baca selengkapnya</span>
                                        <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                                        </svg>
                                    </div>
                                </div>
                            </Link>
                        </div>
                    ))}
                </div>
            </main>

            <Footer />
        </div>
    );
}