import React, { useState, useEffect } from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2, UploadCloud, FileUp, Save, Loader2, Image as ImageIcon, ExternalLink } from "lucide-react";

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api').replace(/\/api$/, '');

export const Route = createFileRoute('/_adminkonten/admin-konten/dokumen/pustaka')({
  component: PustakaEditor,
});

function PustakaEditor() {
  const [data, setData] = useState<any>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/get_pustaka.php`)
      .then(res => res.json())
      .then(res => {
        setData(res.status === 'success' ? res.data : {
          title: "PUSTAKA & DOKUMEN",
          subtitle: "Pusat Dokumentasi dan Informasi",
          bg_image: null,
          categories: { "Buku Panduan": [], "Laporan Kinerja": [], "Peraturan": [] }
        });
      });
  }, []);

  // Fungsi helper untuk update item agar kode lebih bersih
  const updateItem = (category: string, index: number, field: string, value: any) => {
    setData((prev: any) => ({
      ...prev,
      categories: {
        ...prev.categories,
        [category]: prev.categories[category].map((item: any, i: number) => 
          i === index ? { ...item, [field]: value } : item
        )
      }
    }));
  };

  const handleBgUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => setData({ ...data, bg_image: e.target?.result });
      reader.readAsDataURL(file);
    }
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
    const response = await fetch(`${API_BASE_URL}/api/save_pustaka.php`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    const result = await response.json();
    alert(result.status === 'success' ? "Berhasil disimpan!" : "Gagal menyimpan");
    setSaving(false);
  };

  if (!data) return <div className="p-10 text-center">Loading...</div>;

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-8 bg-slate-50/50 min-h-screen">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Manajemen Pustaka</h1>
          <p className="text-slate-500">Kelola koleksi dokumen dan informasi.</p>
        </div>
        <Button onClick={handleSave} disabled={saving} className="w-full sm:w-auto">
          {saving ? <Loader2 className="animate-spin mr-2" /> : <Save className="mr-2 h-4 w-4" />} Simpan
        </Button>
      </div>

      <Card>
        <CardHeader><CardTitle>Pengaturan Hero Header</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <Label>Background Header</Label>
          {data.bg_image ? (
            <div className="relative group w-full h-40 border-2 border-dashed rounded-lg overflow-hidden">
              <img src={data.bg_image.startsWith('data') ? data.bg_image : `${API_BASE_URL}/uploads/${data.bg_image}`} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                <Button variant="secondary" onClick={() => document.getElementById('bg-upload')?.click()}>Ganti</Button>
                <Button variant="destructive" className="ml-2" onClick={() => setData({ ...data, bg_image: null })}>Hapus</Button>
              </div>
            </div>
          ) : (
            <Button variant="outline" className="w-full h-40 border-dashed" onClick={() => document.getElementById('bg-upload')?.click()}>
              <ImageIcon className="mr-2" /> Klik untuk Upload
            </Button>
          )}
          <input type="file" id="bg-upload" className="hidden" accept="image/*" onChange={handleBgUpload} />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input placeholder="Judul Utama" value={data.title} onChange={(e) => setData({ ...data, title: e.target.value })} />
            <Input placeholder="Subtitle" value={data.subtitle} onChange={(e) => setData({ ...data, subtitle: e.target.value })} />
          </div>
        </CardContent>
      </Card>

      {Object.keys(data.categories || {}).map((category) => (
        <Card key={category}>
          <CardHeader className="flex flex-row justify-between items-center py-4 px-6 border-b">
            <CardTitle className="text-lg">{category}</CardTitle>
            <Button variant="outline" size="sm" onClick={() => setData((prev: any) => ({ ...prev, categories: { ...prev.categories, [category]: [...(prev.categories[category] || []), { id: Date.now(), title: "", type: "url", value: "" }] } }))}>
              <Plus className="mr-2 h-4 w-4" /> Tambah
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            {(data.categories[category] || []).map((item: any, index: number) => (
              <div key={item.id} className="flex flex-col md:flex-row gap-4 p-4 md:p-6 border-b items-center hover:bg-slate-50">
                <div className="flex-1 w-full space-y-1">
                    <Label className="text-[10px] uppercase font-bold text-slate-400">Judul</Label>
                    <Input value={item.title} onChange={(e) => updateItem(category, index, 'title', e.target.value)} />
                </div>
                <div className="w-full md:w-32 space-y-1">
                    <Label className="text-[10px] uppercase font-bold text-slate-400">Tipe</Label>
                    <Select value={item.type || 'url'} onValueChange={(v) => updateItem(category, index, 'type', v)}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent><SelectItem value="url">Link</SelectItem><SelectItem value="file">File</SelectItem></SelectContent>
                    </Select>
                </div>
                <div className="flex-1 w-full space-y-1">
                    <Label className="text-[10px] uppercase font-bold text-slate-400">{item.type === 'url' ? 'URL' : 'File'}</Label>
                    <div className="flex gap-2">
                        {item.type === 'url' ? (
                            <Input value={item.value} onChange={(e) => updateItem(category, index, 'value', e.target.value)} />
                        ) : (
                            <Button variant="outline" className="w-full justify-start" onClick={() => document.getElementById(`f-${item.id}`)?.click()}>
                                <UploadCloud className="mr-2 h-4 w-4" /> {item.value || "Pilih File"}
                            </Button>
                        )}
                        {item.value && (
                            <Button variant="ghost" size="icon" onClick={() => window.open(item.type === 'file' ? `${API_BASE_URL}/uploads/${item.value}` : item.value, '_blank')}>
                                <ExternalLink className="h-4 w-4" />
                            </Button>
                        )}
                    </div>
                    <input type="file" id={`f-${item.id}`} className="hidden" onChange={(e) => handleFileUpload(e, category, index)} />
                </div>
                <Button variant="ghost" size="icon" onClick={() => setData((prev: any) => ({ ...prev, categories: { ...prev.categories, [category]: prev.categories[category].filter((_: any, i: number) => i !== index) } }))}>
                    <Trash2 className="text-red-500" />
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}