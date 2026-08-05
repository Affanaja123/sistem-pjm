import React, { useState, useEffect } from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Trash2, UploadCloud, Save, Loader2, X } from "lucide-react";

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api').replace(/\/api$/, '');

export const Route = createFileRoute('/_adminkonten/admin-konten/tentang/visi-misi')({
  component: VisiMisiEditor,
});

function VisiMisiEditor() {
  const [data, setData] = useState({
    title: "",
    subtitle: "",
    visi: "",
    misi: [] as string[],
    bg_image: null as string | null
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/get_visi_misi.php`)
      .then(res => res.json())
      .then(res => {
        if (res.status === 'success' && res.data) {
          setData({
            title: res.data.title || "",
            subtitle: res.data.subtitle || "",
            visi: res.data.visi || "",
            misi: res.data.misi ? res.data.misi.split('\n') : [],
            bg_image: res.data.bg_url || null
          });
        }
        setLoading(false);
      });
  }, []);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onload = (e) => setData(prev => ({ ...prev, bg_image: e.target?.result as string }));
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    // Pastikan kita mengirimkan 'subtitle' dalam objek payload
    const payload = {
      title: data.title,
      subtitle: data.subtitle, // Pastikan ini terkirim
      visi: data.visi,
      misi: data.misi.join('\n'),
      bg_image: data.bg_image
    };

    try {
      const response = await fetch(`${API_BASE_URL}/api/save_visi_misi.php`, {
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

  const addMisi = () => setData({ ...data, misi: [...data.misi, ""] });
  const updateMisi = (index: number, value: string) => {
    const newMisi = [...data.misi];
    newMisi[index] = value;
    setData({ ...data, misi: newMisi });
  };
  const removeMisi = (index: number) => {
    setData({ ...data, misi: data.misi.filter((_, i) => i !== index) });
  };

  if (loading) return <div className="p-8">Memuat data...</div>;

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-8 bg-slate-50/50 min-h-screen">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Visi & Misi</h1>
          <p className="text-slate-500 mt-1">Kelola visi dan misi institusi.</p>
        </div>
        <Button onClick={handleSave} disabled={saving} className="bg-slate-900 hover:bg-slate-800 text-white w-full sm:w-auto">
          {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
          {saving ? "Menyimpan..." : "Simpan"}
        </Button>
      </div>

      <Card className="border-slate-200 shadow-sm">
        <CardHeader className="bg-white border-b py-4 px-6"><CardTitle className="text-lg">Header Section</CardTitle></CardHeader>
        <CardContent className="p-6 space-y-6">
          <div className="space-y-1.5">
            <Label className="text-[11px] font-bold text-slate-500 uppercase">Background Header</Label>
            {data.bg_image ? (
              <div className="relative h-24 border rounded-lg overflow-hidden cursor-pointer" onClick={() => document.getElementById('bg-upload')?.click()}>
                <img src={data.bg_image} className="w-full h-full object-cover" />
                <Button variant="destructive" size="icon" className="absolute top-1 right-1 h-6 w-6" onClick={(e) => { e.stopPropagation(); setData({ ...data, bg_image: null }) }}><X size={12} /></Button>
              </div>
            ) : (
              <Button variant="outline" className="w-full h-24 border-dashed flex flex-col gap-2 text-slate-500" onClick={() => document.getElementById('bg-upload')?.click()}>
                <UploadCloud className="h-6 w-6" /> <span className="text-xs">Upload Background Header</span>
              </Button>
            )}
            <input type="file" id="bg-upload" className="hidden" accept="image/*" onChange={handleImageChange} />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-1.5">
              <Label className="text-[11px] font-bold text-slate-500 uppercase">Judul</Label>
              <Input value={data.title} onChange={(e) => setData({ ...data, title: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[11px] font-bold text-slate-500 uppercase">Subtitle</Label>
              <Input value={data.subtitle} onChange={(e) => setData({ ...data, subtitle: e.target.value })} />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="border-slate-200 shadow-sm">
        <CardHeader className="bg-white border-b py-4 px-6"><CardTitle className="text-lg">Visi Institusi</CardTitle></CardHeader>
        <CardContent className="p-6">
          <Input value={data.visi} onChange={(e) => setData({ ...data, visi: e.target.value })} />
        </CardContent>
      </Card>

      <Card className="border-slate-200 shadow-sm">
        <CardHeader className="bg-white border-b py-4 px-6 flex flex-row justify-between items-center">
          <CardTitle className="text-lg">Misi Institusi</CardTitle>
          <Button variant="outline" size="sm" onClick={addMisi}>
            <Plus className="mr-2 h-4 w-4" /> Tambah Misi
          </Button>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          {data.misi.map((m, index) => (
            <div key={index} className="flex gap-2 items-center">
              <Input value={m} onChange={(e) => updateMisi(index, e.target.value)} placeholder={`Misi ke-${index + 1}`} />
              <Button variant="ghost" size="icon" className="text-slate-300 hover:text-red-500 shrink-0" onClick={() => removeMisi(index)}>
                <Trash2 size={18} />
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}