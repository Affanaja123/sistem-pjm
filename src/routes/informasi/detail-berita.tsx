import React, { useState, useEffect } from 'react';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { Link, createFileRoute } from '@tanstack/react-router';

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api').replace(/\/api$/, '');

export const Route = createFileRoute('/informasi/detail-berita')({
  validateSearch: (search: Record<string, unknown>) => ({
    id: String(search.id || ''),
  }),
  component: DetailBeritaPage,
});

function parseParagraphs(raw: any): string[] {
  if (!raw) return [];
  if (Array.isArray(raw)) {
    return raw.map(c => String(c)).filter(c => c.trim() !== "");
  }
  if (typeof raw === 'string') {
    const trimmed = raw.trim();
    if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
      try {
        const parsed = JSON.parse(trimmed);
        if (Array.isArray(parsed)) {
          return parsed.map(c => String(c)).filter(c => c.trim() !== "");
        }
      } catch {
        // Fallback
      }
    }
    return trimmed.split('\n').filter(c => c.trim() !== "");
  }
  return [String(raw)];
}

function DetailBeritaPage() {
  const { id } = Route.useSearch() as any;
  const [berita, setBerita] = useState<{
    title: string;
    date: string;
    content: string[];
    image1: string | null;
    image2: string | null;
  } | null>(null);

  const [pengumumanList, setPengumumanList] = useState<{
    title: string;
    date: string;
    action_url: string;
    tipe: 'file' | 'link'
  }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  // Load Data Berita
  useEffect(() => {
    if (!id) {
      setLoading(false);
      setError(true);
      return;
    }
    fetch(`${API_BASE_URL}/api/get_detail_berita.php?id=${id}`)
      .then(res => res.json())
      .then(res => {
        if (res.status === 'success' && res.data) {
          const parsedContent = parseParagraphs(res.data.content);
          const img1 = res.data.image1_url || (res.data.image1 ? (res.data.image1.startsWith('http') ? res.data.image1 : `${API_BASE_URL}/uploads/${res.data.image1}`) : null);
          const img2 = res.data.image2_url || (res.data.image2 ? (res.data.image2.startsWith('http') ? res.data.image2 : `${API_BASE_URL}/uploads/${res.data.image2}`) : null);

          setBerita({
            title: res.data.judul || res.data.title || '',
            date: res.data.tanggal || res.data.date || '',
            image1: img1,
            image2: img2,
            content: parsedContent.length > 0 ? parsedContent : [res.data.ringkasan || ''],
          });
        } else {
          setError(true);
        }
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [id]);

  // Load Data Pengumuman Real-time
  useEffect(() => {
    fetch(`${API_BASE_URL}/api/get_pengumuman.php`)
      .then(res => res.json())
      .then(res => {
        if (res.status === 'success' && res.data) {
          setPengumumanList(res.data.map((item: any) => ({
            title: item.judul,
            date: item.tanggal,
            action_url: item.action_url,
            tipe: item.tipe
          })));
        }
      });
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 text-gray-900 font-sans">
      <Header />
      <main className="max-w-7xl mx-auto px-6 py-16 grid grid-cols-1 lg:grid-cols-12 gap-12">

        <div className="lg:col-span-8 bg-white p-8 md:p-10 rounded border border-gray-200">
          {loading && (
            <div className="flex flex-col items-center justify-center py-24 text-gray-400">
              <p>Memuat berita...</p>
            </div>
          )}

          {!loading && error && (
            <div className="text-center py-24 text-gray-400">
              <p className="text-lg font-medium mb-2">Berita tidak ditemukan.</p>
              <Link to="/informasi/berita" className="text-blue-800 hover:underline">← Kembali ke Berita</Link>
            </div>
          )}

          {!loading && !error && berita && (
            <>
              <h1 className="text-3xl md:text-4xl font-bold text-gray-900 leading-snug">{berita.title}</h1>
              <div className="mt-4 text-sm text-gray-500 font-medium">{berita.date}</div>

              {berita.image1 && (
                <div className="w-full h-64 md:h-96 bg-gray-200 rounded-lg overflow-hidden my-8 shadow-sm">
                  <img src={berita.image1} alt="Gambar Utama" className="w-full h-full object-cover" />
                </div>
              )}

              <article className="prose prose-lg max-w-none text-gray-800 leading-relaxed space-y-6">
                {berita.content.map((para, index) => (
                  <React.Fragment key={index}>
                    {para && <p>{para}</p>}
                    {index === 4 && berita.image2 && (
                      <div className="my-8 w-full h-64 md:h-80 rounded-lg overflow-hidden border border-gray-200 shadow-sm">
                        <img src={berita.image2} alt="Ilustrasi" className="w-full h-full object-cover" />
                      </div>
                    )}
                  </React.Fragment>
                ))}

                {berita.image2 && berita.content.length <= 4 && (
                  <div className="my-8 w-full h-64 md:h-80 rounded-lg overflow-hidden border border-gray-200 shadow-sm">
                    <img src={berita.image2} alt="Ilustrasi" className="w-full h-full object-cover" />
                  </div>
                )}
              </article>

              <div className="mt-12 pt-8 border-t border-gray-100">
                <span
                  onClick={() => window.history.back()}
                  className="text-sm font-semibold text-blue-800 hover:underline cursor-pointer"
                >
                  ← Kembali
                </span>
              </div>
            </>
          )}
        </div>

        <aside className="lg:col-span-4">
          <div className="bg-white p-6 rounded-lg border border-gray-200 sticky top-24">
            <h3 className="text-base font-bold text-gray-900 mb-6 pb-2 border-b-2 border-gray-900 inline-block uppercase tracking-wider">
              PENGUMUMAN
            </h3>
            {pengumumanList.length === 0 ? (
              <p className="text-sm text-gray-400 italic">Belum ada pengumuman.</p>
            ) : (
              <ul className="space-y-6">
                {pengumumanList.map((item, idx) => (
                  <li key={idx} className="group border-b border-gray-50 pb-4 last:border-0 last:pb-0">
                    <a
                      href={item.action_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block cursor-pointer"
                      {...(item.tipe === 'file' ? { download: true } : {})}
                    >
                      <p className="text-sm font-medium text-gray-800 group-hover:text-blue-800 transition-colors">
                        {item.title}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">{item.date}</p>
                    </a>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </aside>
      </main>
      <Footer />
    </div>
  );
}