import React, { useState, useEffect } from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { UploadCloud, Save, Loader2, X } from "lucide-react";

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api').replace(/\/api$/, '');

export const Route = createFileRoute('/_adminkonten/admin-konten/pelaporan')({
  component: RouteComponent,
});

function RouteComponent() {
  const [data, setData] = useState({
    title: "",
    subtitle: "",
    bgImage: null as string | null,
  });
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  // 1. Load data saat halaman dibuka
  useEffect(() => {
    fetch(`${API_BASE_URL}/api/get_pelaporan.php`)
      .then(res => res.json())
      .then(res => {
        if (res.status === 'success' && res.data) {
          setData({
            title: res.data.title || "",
            subtitle: res.data.subtitle || "",
            bgImage: res.data.image_path || null,
          });
        }
        setLoading(false);
      })
      .catch(err => {
        console.error("Gagal memuat:", err);
        setLoading(false);
      });
  }, []);

  // 2. Fungsi Simpan ke Backend
  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/save_pelaporan.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        // Mengirim objek dengan kunci yang tepat
        body: JSON.stringify({
          title: data.title,
          subtitle: data.subtitle,
          bgImage: data.bgImage // Pastikan key ini sesuai dengan PHP
        })
      });

      if (!response.ok) throw new Error(`Status: ${response.status}`);

      const result = await response.json();
      if (result.status === 'success') {
        alert("Data berhasil disimpan!");
      } else {
        alert("Error dari Server: " + result.message);
      }
    } catch (err) {
      console.error("Detail Error:", err);
      alert("Gagal koneksi ke server. Periksa Console F12.");
    } finally {
      setSaving(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onload = (e) => setData(prev => ({ ...prev, bgImage: e.target?.result as string }));
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  if (loading) return <div className="p-8 text-center">Memuat...</div>;

  return (
    <div className="p-4 sm:p-8 max-w-4xl mx-auto space-y-6 min-h-screen">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">Editor Halaman Pelaporan</h1>
          <p className="text-slate-500 text-sm mt-1">Konfigurasi konten untuk halaman Pelaporan Mutu.</p>
        </div>
        <Button onClick={handleSave} disabled={saving} className="w-full sm:w-auto bg-slate-900">
          {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
          {saving ? "Menyimpan..." : "Simpan Perubahan"}
        </Button>
      </div>

      <Card className="border-slate-200 shadow-sm">
        <CardHeader className="bg-white border-b py-4 px-6">
          <CardTitle className="text-lg">Pengaturan Hero Section</CardTitle>
        </CardHeader>
        <CardContent className="p-4 sm:p-6 space-y-6">
          <div className="space-y-1.5">
            <Label className="text-[11px] font-bold text-slate-500 uppercase">Gambar Background Utama</Label>
            {!data.bgImage ? (
              <div
                className="border-2 border-dashed rounded-lg p-8 flex flex-col items-center justify-center cursor-pointer border-slate-200 hover:border-slate-400 transition-colors"
                onClick={() => document.getElementById('pelaporan-upload')?.click()}
              >
                <UploadCloud className="h-8 w-8 mb-2 text-slate-400" />
                <span className="text-sm text-slate-600">Klik untuk upload gambar</span>
              </div>
            ) : (
              <div className="relative rounded-lg overflow-hidden border border-slate-300">
                <img src={data.bgImage} alt="Preview" className="w-full h-48 object-cover" />
                <Button
                  variant="destructive" size="icon" className="absolute top-2 right-2 h-8 w-8"
                  onClick={() => setData(prev => ({ ...prev, bgImage: null }))}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
            )}
            <input type="file" id="pelaporan-upload" className="hidden" accept="image/*" onChange={handleImageChange} />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
            <div className="space-y-1.5">
              <Label className="text-[11px] font-bold text-slate-500 uppercase">Judul Utama</Label>
              <Input
                value={data.title}
                onChange={(e) => setData({ ...data, title: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[11px] font-bold text-slate-500 uppercase">Sub-judul / Deskripsi</Label>
              <Input
                value={data.subtitle}
                onChange={(e) => setData({ ...data, subtitle: e.target.value })}
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}