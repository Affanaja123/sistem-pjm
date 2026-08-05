import React, { useState, useEffect } from 'react';
import { createFileRoute, Link } from '@tanstack/react-router';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UploadCloud, Save, Loader2, X, Eye } from "lucide-react";

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api').replace(/\/api$/, '');

export const Route = createFileRoute('/_adminkonten/admin-konten/beranda')({
  component: AdminBeranda,
});

function AdminBeranda() {
  const [heroData, setHeroData] = useState({
    title: "",
    subtitle: "",
    bgImage: null as string | null,
    fileName: "" as string,
  });

  // State untuk 3 layanan mutu
  const [servicesData, setServicesData] = useState({
    pelaporan: { title: "", subtitle: "" },
    sistem_informasi: { title: "", subtitle: "" },
    konsultasi_mutu: { title: "", subtitle: "" }
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
    
    // Ambil data Hero & Layanan Mutu secara bersamaan
    Promise.all([
      fetch(`${API_BASE_URL}/api/get_content.php?section=hero`).then(res => res.json()).catch(() => null),
      fetch(`${API_BASE_URL}/api/get_content.php?section=layanan_pelaporan`).then(res => res.json()).catch(() => null),
      fetch(`${API_BASE_URL}/api/get_content.php?section=layanan_sistem`).then(res => res.json()).catch(() => null),
      fetch(`${API_BASE_URL}/api/get_content.php?section=layanan_konsultasi`).then(res => res.json()).catch(() => null),
    ])
    .then(([heroRes, pelaporanRes, sistemRes, konsultasiRes]) => {
      if (heroRes && heroRes.status === 'success' && heroRes.data) {
        setHeroData({
          title: heroRes.data.title || "",
          subtitle: heroRes.data.subtitle || "",
          bgImage: heroRes.data.image || null,
          fileName: heroRes.data.image ? "Gambar Tersimpan" : ""
        });
      }

      setServicesData({
        pelaporan: {
          title: pelaporanRes?.data?.title || "",
          subtitle: pelaporanRes?.data?.subtitle || ""
        },
        sistem_informasi: {
          title: sistemRes?.data?.title || "",
          subtitle: sistemRes?.data?.subtitle || ""
        },
        konsultasi_mutu: {
          title: konsultasiRes?.data?.title || "",
          subtitle: konsultasiRes?.data?.subtitle || ""
        }
      });

      setLoading(false);
    })
    .catch((err) => {
      console.error("Gagal memuat data:", err);
      setLoading(false);
    });
  }, []);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (e) => setHeroData(prev => ({
        ...prev,
        bgImage: e.target?.result as string,
        fileName: file.name
      }));
      reader.readAsDataURL(file);
    }
  };

  const removeImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setHeroData(prev => ({ ...prev, bgImage: null, fileName: "" }));
  };

  const handleSave = async () => {
    setSaving(true);
    
    // Kumpulkan seluruh data yang akan di-update ke backend
    const updates = [
      // Hero Section
      { section: 'hero', field: 'title', value: heroData.title },
      { section: 'hero', field: 'subtitle', value: heroData.subtitle },
      { section: 'hero', field: 'image', value: heroData.bgImage },

      // Layanan Pelaporan
      { section: 'layanan_pelaporan', field: 'title', value: servicesData.pelaporan.title },
      { section: 'layanan_pelaporan', field: 'subtitle', value: servicesData.pelaporan.subtitle },

      // Layanan Sistem Informasi
      { section: 'layanan_sistem', field: 'title', value: servicesData.sistem_informasi.title },
      { section: 'layanan_sistem', field: 'subtitle', value: servicesData.sistem_informasi.subtitle },

      // Layanan Konsultasi Mutu
      { section: 'layanan_konsultasi', field: 'title', value: servicesData.konsultasi_mutu.title },
      { section: 'layanan_konsultasi', field: 'subtitle', value: servicesData.konsultasi_mutu.subtitle },
    ];

    try {
      for (const item of updates) {
        await fetch(`${API_BASE_URL}/api/save_content.php`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            section_key: item.section,
            field_name: item.field,
            content_value: item.value
          })
        });
      }
      alert("Berhasil disimpan!");
    } catch (err) {
      alert("Gagal menyimpan ke database.");
    } finally {
      setSaving(false);
    }
  };

  if (!isClient || loading) return <div className="p-8 text-center">Memuat data...</div>;

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto space-y-6 min-h-screen">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Editor Beranda</h1>
          <p className="text-slate-500 text-sm mt-1">Konfigurasi konten utama website.</p>
        </div>
        <Button onClick={handleSave} disabled={saving} className="w-full sm:w-auto bg-slate-900 hover:bg-slate-800 text-white">
          {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
          {saving ? "Menyimpan..." : "Simpan"}
        </Button>
      </div>

      <Card className="border-slate-200 shadow-sm">
        <CardHeader className="bg-white border-b py-4 px-6"><CardTitle className="text-lg">Pengaturan Hero Section</CardTitle></CardHeader>
        <CardContent className="p-4 sm:p-6 space-y-6">
          <div className="space-y-1.5">
            <Label className="text-[11px] font-bold text-slate-500 uppercase">Gambar Background Utama</Label>
            {!heroData.bgImage ? (
              <div className="border-2 border-dashed rounded-lg p-6 sm:p-8 flex flex-col items-center justify-center cursor-pointer border-slate-200 hover:border-slate-400 transition-colors" onClick={() => document.getElementById('bg-upload')?.click()}>
                <UploadCloud className="h-8 w-8 mb-2 text-slate-400" />
                <span className="text-sm text-slate-600 font-medium text-center">Klik untuk upload gambar</span>
              </div>
            ) : (
              <div className="relative rounded-lg overflow-hidden border border-slate-300">
                <img src={heroData.bgImage} alt="Preview" className="w-full h-48 object-cover" />
                <div className="absolute top-2 right-2">
                  <Button variant="destructive" size="icon" className="h-8 w-8" onClick={removeImage}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                <div className="bg-slate-800/80 text-white text-xs p-2 truncate">
                  {heroData.fileName}
                </div>
              </div>
            )}
            <input type="file" id="bg-upload" className="hidden" accept="image/*" onChange={handleImageChange} />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            <div className="space-y-1.5">
              <Label className="text-[11px] font-bold text-slate-500 uppercase">Judul Utama</Label>
              <Input value={heroData.title} onChange={(e) => setHeroData({ ...heroData, title: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[11px] font-bold text-slate-500 uppercase">Sub-judul / Deskripsi</Label>
              <Input value={heroData.subtitle} onChange={(e) => setHeroData({ ...heroData, subtitle: e.target.value })} />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-slate-200 shadow-sm mt-6">
        <CardHeader className="bg-white border-b py-4 px-6">
          <CardTitle className="text-lg">Pengaturan Layanan Mutu</CardTitle>
        </CardHeader>
        <CardContent className="p-4 sm:p-6 space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {[
              { key: 'pelaporan', name: 'Pelaporan', path: '/admin-konten/pelaporan' },
              { key: 'sistem_informasi', name: 'Sistem Informasi', path: '/admin-konten/sistem-informasi' },
              { key: 'konsultasi_mutu', name: 'Konsultasi Mutu', path: '/admin-konten/konsultasi-mutu' }
            ].map((fitur) => {
              const currentService = servicesData[fitur.key as keyof typeof servicesData];

              return (
                <div key={fitur.key} className="space-y-4 p-4 border border-slate-200 rounded-lg bg-slate-50/50">
                  <div className="flex justify-between items-center">
                    <h3 className="font-semibold text-sm text-slate-800">{fitur.name}</h3>
                    <Link
                      to={fitur.path as any}
                      className="p-2 rounded-full text-slate-400 hover:text-slate-900 hover:bg-slate-200 transition-all"
                      title="Lihat Detail"
                    >
                      <Eye size={20} />
                    </Link>
                  </div>
                  <div className="space-y-3">
                    <div className="space-y-1.5">
                      <Label className="text-[10px] font-bold text-slate-500 uppercase">Judul</Label>
                      <Input
                        value={currentService.title}
                        onChange={(e) => {
                          const val = e.target.value;
                          setServicesData(prev => ({
                            ...prev,
                            [fitur.key]: { ...prev[fitur.key as keyof typeof prev], title: val }
                          }));
                        }}
                        placeholder={`Judul ${fitur.name}...`}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-[10px] font-bold text-slate-500 uppercase">Sub-judul (Deskripsi)</Label>
                      <textarea
                        value={currentService.subtitle}
                        onChange={(e) => {
                          const val = e.target.value;
                          setServicesData(prev => ({
                            ...prev,
                            [fitur.key]: { ...prev[fitur.key as keyof typeof prev], subtitle: val }
                          }));
                        }}
                        className="flex min-h-[100px] w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm placeholder:text-slate-400 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-slate-950"
                        placeholder={`Masukkan deskripsi lengkap untuk ${fitur.name}...`}
                      />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}