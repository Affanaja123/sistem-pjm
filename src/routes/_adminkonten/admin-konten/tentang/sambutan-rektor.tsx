import React, { useState, useEffect } from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { UploadCloud, Save, Loader2 } from "lucide-react";

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api').replace(/\/api$/, '');

export const Route = createFileRoute('/_adminkonten/admin-konten/tentang/sambutan-rektor')({
  component: SambutanRektorEditor,
});

function SambutanRektorEditor() {
  const [data, setData] = useState({
    title: "",
    subtitle: "",
    nama_rektor: "",
    gelar_rektor: "",
    isi_sambutan: "",
    foto_rektor: null as string | null,
    bg_image: null as string | null
  });
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/get_sambutan.php`)
      .then(res => res.json())
      .then(res => {
        if (res.status === 'success' && res.data) {
          setData({
            title: res.data.title || "",
            subtitle: res.data.subtitle || "",
            nama_rektor: res.data.nama_rektor || "",
            gelar_rektor: res.data.gelar_rektor || "",
            isi_sambutan: res.data.isi_sambutan || "",
            foto_rektor: res.data.foto_url || null,
            bg_image: res.data.bg_url || null
          });
        }
        setLoading(false);
      });
  }, []);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>, field: 'foto_rektor' | 'bg_image') => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onload = (e) => setData(prev => ({ ...prev, [field]: e.target?.result as string }));
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    // Payload disesuaikan dengan kebutuhan api/save_sambutan.php
    const payload = {
      title: data.title,
      subtitle: data.subtitle,
      nama_rektor: data.nama_rektor,
      gelar_rektor: data.gelar_rektor,
      isi_sambutan: data.isi_sambutan,
      foto_rektor: data.foto_rektor,
      bg_image: data.bg_image
    };

    try {
      const response = await fetch(`${API_BASE_URL}/api/save_sambutan.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const result = await response.json();
      if (result.status === 'success') {
        alert("Berhasil disimpan!");
      } else {
        alert("Gagal: " + result.message);
      }
    } catch (err) {
      alert("Error saat menyimpan.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-8">Memuat...</div>;

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-8 bg-slate-50/50 min-h-screen bg-gray-300">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Editor Sambutan Rektor</h1>
        <Button onClick={handleSave} disabled={saving} className="bg-slate-900 text-white">
          {saving ? <Loader2 className="animate-spin mr-2" /> : <Save className="mr-2 h-4 w-4" />} Simpan
        </Button>
      </div>

      <Card className="p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1"><Label>Judul Utama</Label><Input value={data.title} onChange={e => setData({ ...data, title: e.target.value })} /></div>
          <div className="space-y-1"><Label>Subjudul</Label><Input value={data.subtitle} onChange={e => setData({ ...data, subtitle: e.target.value })} /></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label>Background Section</Label>
            <div className="relative h-40 border-2 border-dashed rounded-lg flex items-center justify-center cursor-pointer overflow-hidden" onClick={() => document.getElementById('bg-upload')?.click()}>
              {data.bg_image ? <img src={data.bg_image} className="w-full h-full object-cover" /> : <UploadCloud className="text-slate-400" />}
              <input type="file" id="bg-upload" className="hidden" onChange={(e) => handleImageChange(e, 'bg_image')} />
            </div>
          </div>
          <div className="space-y-2">
            <Label>Foto Rektor</Label>
            <div className="relative h-40 border-2 border-dashed rounded-lg flex items-center justify-center cursor-pointer overflow-hidden" onClick={() => document.getElementById('foto-upload')?.click()}>
              {data.foto_rektor ? <img src={data.foto_rektor} className="w-full h-full object-cover" /> : <UploadCloud className="text-slate-400" />}
              <input type="file" id="foto-upload" className="hidden" onChange={(e) => handleImageChange(e, 'foto_rektor')} />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <Input placeholder="Nama Rektor" value={data.nama_rektor} onChange={e => setData({ ...data, nama_rektor: e.target.value })} />
          <Input placeholder="Gelar" value={data.gelar_rektor} onChange={e => setData({ ...data, gelar_rektor: e.target.value })} />
        </div>
        <Textarea value={data.isi_sambutan} onChange={e => setData({ ...data, isi_sambutan: e.target.value })} className="h-40" />
      </Card>
    </div>
  );
}