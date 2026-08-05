import React, { useState, useEffect } from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2, UploadCloud, FileUp, Link as LinkIcon, ClipboardList, Save, Loader2 } from "lucide-react";

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api').replace(/\/api$/, '');

export const Route = createFileRoute('/_adminkonten/admin-konten/evaluasi/instrumen')({
  component: EvaluasiEditor,
});

function EvaluasiEditor() {
  const [data, setData] = useState<any>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/get_evaluasi.php`)
      .then(res => res.json())
      .then(res => {
        setData(res.status === 'success' ? res.data : {
          title: "INSTRUMEN EVALUASI",
          categories: { "Instrumen AMI": [], "Instrumen Survei": [], "Instrumen Asesmen": [] }
        });
      });
  }, []);

  const updateItem = (category: string, index: number, field: string, value: any) => {
    setData((prev: any) => ({
      ...prev,
      categories: {
        ...prev.categories,
        [category]: prev.categories[category].map((item: any, i: number) => i === index ? { ...item, [field]: value } : item)
      }
    }));
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, cat: string, idx: number) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('file', file);
    try {
      const res = await fetch(`${API_BASE_URL}/api/upload_file.php`, { method: 'POST', body: formData });
      const result = await res.json();
      if (result.status === 'success') {
        updateItem(cat, idx, 'value', result.file);
      }
    } catch (e) { alert("Gagal upload file"); }
  };

  const handleSave = async () => {
    setSaving(true);

    // Pastikan kita mengirim data lengkap, termasuk bg_image dan subtitle
    const payload = {
      title: data.title,
      subtitle: data.subtitle,
      bg_image: data.bg_image,
      categories: data.categories
    };

    try {
      const response = await fetch(`${API_BASE_URL}/api/save_evaluasi.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const result = await response.json();
      if (result.status === 'success') {
        alert("Berhasil disimpan!");
      } else {
        alert("Gagal menyimpan: " + result.message);
      }
    } catch (err) {
      alert("Error saat koneksi ke server");
    } finally {
      setSaving(false);
    }
  };

  const handleBgUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => setData({ ...data, bg_image: e.target?.result });
      reader.readAsDataURL(file);
    }
  }

  if (!data) return <div className="p-10 text-center">Loading...</div>;

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-8 bg-slate-50/50 min-h-screen">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Instrumen Evaluasi</h1>
          <p className="text-slate-500 mt-1">Kelola dokumen instrumen evaluasi mutu institusi.</p>
        </div>
        <Button onClick={handleSave} disabled={saving} className="bg-slate-900 hover:bg-slate-800 text-white shadow-lg w-full sm:w-auto">
          {saving ? <Loader2 className="animate-spin mr-2" /> : <Save className="mr-2 h-4 w-4" />}
          {saving ? "Menyimpan..." : "Simpan"}
        </Button>
      </div>

      <Card>
        <CardHeader><CardTitle>Pengaturan Hero Header</CardTitle></CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label>Gambar Latar Belakang</Label>
            {data.bg_image ? (
              <div className="relative group w-full h-48 border-2 border-dashed rounded-lg overflow-hidden">
                <img src={data.bg_image.startsWith('data') ? data.bg_image : `${API_BASE_URL}/uploads/${data.bg_image}`} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                  <Button variant="secondary" onClick={() => document.getElementById('bg-upload')?.click()}>Ganti</Button>
                  <Button variant="destructive" className="ml-2" onClick={() => setData({ ...data, bg_image: null })}>Hapus</Button>
                </div>
              </div>
            ) : (
              <div className="w-full h-48 border-2 border-dashed border-slate-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-slate-500" onClick={() => document.getElementById('bg-upload')?.click()}>
                <span>Klik untuk unggah gambar</span>
              </div>
            )}
            <input type="file" id="bg-upload" className="hidden" accept="image/*" onChange={handleBgUpload} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label>Judul Utama</Label>
              <Input value={data.title} onChange={(e) => setData({ ...data, title: e.target.value })} />
            </div>
            <div className="space-y-1">
              <Label>Subtitle</Label>
              <Input value={data.subtitle || ""} onChange={(e) => setData({ ...data, subtitle: e.target.value })} />
            </div>
          </div>
        </CardContent>
      </Card>


      {Object.keys(data.categories || {}).map((category) => (
        <Card key={category} className="border-slate-200 shadow-sm">
          <CardHeader className="bg-white border-b py-4 px-6 flex flex-row justify-between items-center">
            <CardTitle className="text-lg font-bold flex items-center gap-2 text-slate-700">
              <ClipboardList className="h-5 w-5 text-slate-400" /> {category}
            </CardTitle>
            <Button variant="outline" size="sm" onClick={() => setData((prev: any) => ({ ...prev, categories: { ...prev.categories, [category]: [...(prev.categories[category] || []), { id: Date.now(), title: "", type: "url", value: "" }] } }))}>
              <Plus className="mr-2 h-4 w-4" /> Tambah Item
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            {(data.categories[category] || []).map((item: any, index: number) => (
              <div key={item.id} className="grid grid-cols-1 md:grid-cols-12 gap-4 px-6 py-4 border-b border-slate-100 items-end bg-white hover:bg-slate-50 transition-colors">
                <div className="md:col-span-5 space-y-1.5">
                  <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Judul Instrumen</Label>
                  <Input value={item.title} onChange={(e) => updateItem(category, index, 'title', e.target.value)} />
                </div>
                <div className="md:col-span-2 space-y-1.5">
                  <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Sumber</Label>
                  <Select value={item.type || 'url'} onValueChange={(v) => updateItem(category, index, 'type', v)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="url"><div className="flex items-center gap-2"><LinkIcon className="h-3 w-3" /> Link</div></SelectItem>
                      <SelectItem value="file"><div className="flex items-center gap-2"><FileUp className="h-3 w-3" /> File</div></SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="md:col-span-4 space-y-1.5">
                  <Label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">{item.type === 'url' ? 'URL Link' : 'File Dokumen'}</Label>
                  {item.type === 'url' ? (
                    <Input value={item.value} onChange={(e) => updateItem(category, index, 'value', e.target.value)} />
                  ) : (
                    <Button variant="outline" className="w-full justify-start h-10 border-slate-200" onClick={() => document.getElementById(`f-${category}-${index}`)?.click()}>
                      <UploadCloud className="mr-2 h-4 w-4" /> <span className="truncate">{item.value || "Pilih file..."}</span>
                    </Button>
                  )}
                  <input type="file" id={`f-${category}-${index}`} className="hidden" onChange={(e) => handleFileUpload(e, category, index)} />
                </div>
                <div className="md:col-span-1 flex justify-end">
                  <Button variant="ghost" size="icon" onClick={() => setData((prev: any) => ({ ...prev, categories: { ...prev.categories, [category]: prev.categories[category].filter((_: any, i: number) => i !== index) } }))}>
                    <Trash2 size={18} className="text-slate-300 hover:text-red-500" />
                  </Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}