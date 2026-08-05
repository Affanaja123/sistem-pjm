import { Link, createFileRoute } from '@tanstack/react-router';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import React, { useState, useEffect } from 'react';
import heroBg from '/src/assets/ipti1.jpg';

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api').replace(/\/api$/, '');

const HomePage: React.FC = () => {
  const loaderData = Route.useLoaderData() as any;
  const [heroData, setHeroData] = useState({
    title: loaderData?.title || '',
    subtitle: loaderData?.subtitle || '',
    image: loaderData?.image || heroBg
  });

  // State untuk Data Layanan Mutu Dinamis (dikosongkan default-nya agar murni dari database)
  const [layananData, setLayananData] = useState({
    pelaporan: { title: '', subtitle: '' },
    sistem: { title: '', subtitle: '' },
    konsultasi: { title: '', subtitle: '' }
  });

  // State untuk Berita & Pengumuman
  const [beritaList, setBeritaList] = useState<any[]>([]);
  const [pengumumanList, setPengumumanList] = useState<any[]>([]);

  // Fetch Hero & Layanan Mutu saat komponen dimuat
  useEffect(() => {
    // 1. Fetch Hero Section
    fetch(`${API_BASE_URL}/api/get_content.php?section=hero`)
      .then(res => res.json())
      .then(res => {
        if (res.status === 'success' && res.data) {
          setHeroData({
            title: res.data.title || '',
            subtitle: res.data.subtitle || '',
            image: res.data.image || heroBg
          });
        }
      });

    // 2. Fetch Konten Layanan Mutu (Pelaporan, Sistem Informasi, Konsultasi)
    Promise.all([
      fetch(`${API_BASE_URL}/api/get_content.php?section=layanan_pelaporan`).then(res => res.json()).catch(() => null),
      fetch(`${API_BASE_URL}/api/get_content.php?section=layanan_sistem`).then(res => res.json()).catch(() => null),
      fetch(`${API_BASE_URL}/api/get_content.php?section=layanan_konsultasi`).then(res => res.json()).catch(() => null),
    ]).then(([pelaporanRes, sistemRes, konsultasiRes]) => {
      setLayananData({
        pelaporan: {
          title: pelaporanRes?.data?.title || '',
          subtitle: pelaporanRes?.data?.subtitle || ''
        },
        sistem: {
          title: sistemRes?.data?.title || '',
          subtitle: sistemRes?.data?.subtitle || ''
        },
        konsultasi: {
          title: konsultasiRes?.data?.title || '',
          subtitle: konsultasiRes?.data?.subtitle || ''
        }
      });
    });
  }, []);

  // Fetch Info PJM (Berita)
  useEffect(() => {
    fetch(`${API_BASE_URL}/api/get_berita.php`)
      .then(res => res.json())
      .then(res => {
        if (res.status === 'success') setBeritaList(res.data.slice(0, 4));
      });
  }, []);

  // Fetch Pengumuman
  useEffect(() => {
    fetch(`${API_BASE_URL}/api/get_pengumuman.php`)
      .then(res => res.json())
      .then(res => {
        if (res.status === 'success') setPengumumanList(res.data);
      });
  }, []);

  return (
    <div className="min-h-screen bg-white text-gray-900" style={{ fontFamily: '"Poppins", sans-serif' }}>
      <Header />
      
      {/* Hero Section */}
      <section className="bg-white">
        <div style={{ position: 'relative', width: '100%', height: '400px', borderBottomLeftRadius: '20px', borderBottomRightRadius: '20px', overflow: 'hidden' }}>
          <img
            src={heroData.image}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover',
              objectPosition: 'top'
            }}
            alt="Hero Background"
          />

          <div style={{
            position: 'absolute',
            top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.4)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            paddingLeft: '3%'
          }}>
            <h1 style={{ color: 'white', fontSize: '3rem', fontWeight: '350', lineHeight: '1.2' }}>
              {heroData.title}<br />{heroData.subtitle}
            </h1>
          </div>
        </div>
      </section>

      {/* Layanan Mutu Section */}
      <section className="bg-white py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-3 tracking-wide">LAYANAN MUTU</h2>
          <p className="text-gray-500 font-light max-w-2xl mx-auto text-sm">
            Pusat Penjaminan Mutu Institut Pariwisata Tedja Indonesia menyediakan berbagai layanan terpadu untuk memastikan standar kualitas akademik tetap terjaga secara optimal.
          </p>
          <div className="w-16 h-1 bg-gray-900 mx-auto mt-4"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              title: layananData.pelaporan.title,
              desc: layananData.pelaporan.subtitle,
              icon: <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path></svg>,
              link: 'pelaporan'
            },
            {
              title: layananData.sistem.title,
              desc: layananData.sistem.subtitle,
              icon: <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 14l9-5-9-5-9 5 9 5z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.42a12 12 0 010 6.84L12 14z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 14v10M9 22h6"></path></svg>,
              link: 'sistem-informasi'
            },
            {
              title: layananData.konsultasi.title,
              desc: layananData.konsultasi.subtitle,
              icon: <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.344-5.657l.707.707M12 18a6 6 0 100-12 6 6 0 000 12z"></path></svg>,
              link: 'konsultasi-mutu'
            },
          ].map((item, index) => (
            <Link
              key={index}
              to={item.link as any}
              className="group p-8 border border-gray-200 rounded-lg flex flex-col items-center text-center hover:border-gray-900 transition-all duration-300 bg-white shadow-sm"
            >
              <div className="w-14 h-14 bg-gray-50 rounded-full flex items-center justify-center mb-6 text-gray-600 group-hover:bg-gray-900 group-hover:text-white transition-all duration-300">
                {item.icon}
              </div>
              
              {/* Hanya tampilkan judul jika datanya tidak kosong */}
              {item.title && <h3 className="text-md font-semibold text-gray-900 mb-3 tracking-wide">{item.title}</h3>}
              
              {/* Hanya tampilkan deskripsi jika datanya tidak kosong */}
              {item.desc && <p className="text-sm text-gray-500 leading-relaxed mb-6 font-light">{item.desc}</p>}
              
              <span className="text-xs font-bold text-gray-900 uppercase tracking-widest group-hover:text-blue-700 transition-colors mt-auto">Selengkapnya →</span>
            </Link>
          ))}
        </div>
      </section>

      <div className="bg-gray-100 px-0">
        <div className="w-full border-t border-gray-300"></div>
      </div>

      <main className="bg-gray-100 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-12 gap-12">

          {/* INFO PJM (Dinamis) */}
          <section className="md:col-span-8">
            <h3 className="text-3xl font-bold text-gray-900 mb-8 pb-2 border-b-2 border-gray-900 inline-block">INFO PJM</h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
              {beritaList.slice(0, 4).map((info) => (
                <Link
                  key={info.id}
                  to="/informasi/detail-berita"
                  search={{ id: info.id }}
                  className="group bg-white rounded-xl overflow-hidden flex flex-col border border-gray-200 transition-all duration-300 hover:border-blue-500 hover:shadow-lg"
                >
                  <div className="aspect-[16/9] w-full bg-gray-200 overflow-hidden">
                    <img
                      src={info.thumbnail ? `${API_BASE_URL}/uploads/${info.thumbnail}` : 'https://via.placeholder.com/600x337'}
                      alt={info.judul}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="p-5 flex flex-col flex-grow">
                    <p className="text-xs font-bold text-gray-400 mb-2">{info.tanggal}</p>
                    <h4 className="text-lg font-bold text-gray-900 leading-snug mb-3 line-clamp-2">{info.judul}</h4>

                    <p className="text-sm text-gray-600 leading-relaxed line-clamp-3 mb-4 flex-grow">
                      {info.ringkasan || "Tidak ada deskripsi singkat tersedia untuk berita ini."}
                    </p>

                    <span className="text-sm font-semibold text-gray-900 flex items-center mt-auto group-hover:text-blue-600 transition-colors">
                      Baca Selengkapnya →
                    </span>
                  </div>
                </Link>
              ))}
            </div>

            <div className="mt-8 text-right">
              <Link
                to="/informasi/berita"
                className="text-sm font-bold text-gray-700 hover:text-blue-700 transition-colors flex items-center justify-end"
              >
                Lihat Selengkapnya →
              </Link>
            </div>
          </section>

          {/* PENGUMUMAN (Dinamis) */}
          <aside className="md:col-span-4">
            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-200 h-full">
              <h3 className="text-3xl font-bold text-gray-900 mb-8 border-b-2 border-gray-900 pb-2 inline-block">PENGUMUMAN</h3>
              <div className="space-y-6">
                {pengumumanList.map((item) => (
                  <a key={item.id} href={item.action_url || '#'} target="_blank" rel="noreferrer" className="block border-b border-gray-100 pb-4 last:border-0 group">
                    <p className="text-sm font-semibold text-gray-900 group-hover:text-blue-700 transition-colors leading-relaxed">{item.judul}</p>
                    <p className="text-xs text-gray-500 mt-1.5">{item.tanggal}</p>
                  </a>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export const Route = createFileRoute('/')({
  loader: async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/get_content.php?section=hero`);
      const data = await res.json();
      if (data.status === 'success' && data.data) {
        return data.data;
      }
    } catch (e) {
      console.error("Gagal melakukan load data awal:", e);
    }
    return null;
  },
  component: HomePage,
});