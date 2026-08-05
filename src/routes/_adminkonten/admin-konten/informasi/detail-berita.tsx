import React, { useState, useEffect } from 'react';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Save, Plus, Trash2, UploadCloud, Loader2 } from "lucide-react";

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api').replace(/\/api$/, '');

export const Route = createFileRoute('/_adminkonten/admin-konten/informasi/detail-berita')({
  validateSearch: (search: Record<string, unknown>) => ({
    id: String(search.id || ''),
  }),
  component: DetailBeritaEditor,
});

function DetailBeritaEditor() {
  const { id } = Route.useSearch() as any;
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);

  // Track apakah user secara eksplisit menghapus gambar
  const [deleteFlags, setDeleteFlags] = useState({ image1: false, image2: false });

  const [berita, setBerita] = useState({
    title: "",
    date: "",
    image1: null as string | null,
    image2: null as string | null,
    content: [""]
  });

  // 1. LOAD DATA
  useEffect(() => {
    if (id) {
      fetch(`${API_BASE_URL}/api/get_detail_berita.php?id=${id}`)
        .then(res => res.json())
        .then(res => {
          if (res.status === 'success' && res.data) {
            let parsedContent: string[] = [""];
            const rawContent = res.data.content;
            if (Array.isArray(rawContent)) {
              parsedContent = rawContent.map(item => String(item));
            } else if (typeof rawContent === 'string') {
              try {
                const jsonParsed = JSON.parse(rawContent);
                if (Array.isArray(jsonParsed)) {
                  parsedContent = jsonParsed.map(item => String(item));
                } else if (rawContent.trim()) {
                  parsedContent = rawContent.split('\n');
                }
              } catch {
                if (rawContent.trim()) {
                  parsedContent = rawContent.split('\n');
                }
              }
            }

            setBerita({
              title: res.data.judul || "",
              date: res.data.tanggal || "",
              image1: res.data.image1 ? `${API_BASE_URL}/uploads/${res.data.image1}` : null,
              image2: res.data.image2 ? `${API_BASE_URL}/uploads/${res.data.image2}` : null,
              content: parsedContent.length > 0 ? parsedContent : [""]
            });
            setDeleteFlags({ image1: false, image2: false });
          }
        });
    }
  }, [id]);

  // 2. SAVE DATA
  const handleSave = async () => {
    setSaving(true);
    const response = await fetch(`${API_BASE_URL}/api/save_detail_berita.php`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        id,
        title: berita.title,
        date: berita.date,
        content: berita.content,
        image1: berita.image1,
        image2: berita.image2,
        delete_image1: deleteFlags.image1,
        delete_image2: deleteFlags.image2,
      })
    });
    const result = await response.json();
    setSaving(false);
    if (result.status === 'success' || result.success) {
      setDeleteFlags({ image1: false, image2: false });
      alert("Berhasil disimpan!");
    } else {
      alert("Gagal menyimpan: " + (result.message || ''));
    }
  };

  const handleImageUpload = (index: 1 | 2, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setBerita(prev => ({ ...prev, [`image${index}`]: ev.target?.result as string }));
        // Reset flag delete karena user upload gambar baru
        setDeleteFlags(prev => ({ ...prev, [`image${index}`]: false }));
      };
      reader.readAsDataURL(file);
      // Reset value input agar bisa upload file yang sama lagi
      e.target.value = '';
    }
  };

  // Hapus gambar: clear dari state + tandai flag delete ke backend
  const handleDeleteImage = (index: 1 | 2, e: React.MouseEvent) => {
    e.stopPropagation(); // Jangan trigger klik upload
    setBerita(prev => ({ ...prev, [`image${index}`]: null }));
    setDeleteFlags(prev => ({ ...prev, [`image${index}`]: true }));
  };

  const updateParagraph = (index: number, value: string) => {
    const newContent = [...berita.content];
    newContent[index] = value;
    setBerita({ ...berita, content: newContent });
  };

  const addParagraph = () => setBerita({ ...berita, content: [...berita.content, ""] });

  const removeParagraph = (index: number) => {
    if (berita.content.length > 1) {
      setBerita({ ...berita, content: berita.content.filter((_, i) => i !== index) });
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-2 md:gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate({ to: '/admin-konten/informasi/berita' })}>
          <ArrowLeft size={20} />
        </Button>
        <div>
          <h1 className="text-xl md:text-2xl font-bold">Edit Detail Berita</h1>
          <p className="text-xs md:text-sm text-slate-500">ID Berita: {id}</p>
        </div>
      </div>

      <Card>
        <CardHeader className="p-4 md:p-6"><CardTitle className="text-lg">Konten Berita Lengkap</CardTitle></CardHeader>
        <CardContent className="p-4 md:p-6 space-y-6">
          <div className="space-y-2">
            <Label className="text-sm font-semibold">Judul Berita</Label>
            <Input className="text-base py-5" value={berita.title} onChange={(e) => setBerita({...berita, title: e.target.value})} placeholder="Masukkan judul..." />
          </div>

          <div className="space-y-2">
            <Label className="text-sm">Tanggal Terbit</Label>
            <Input type="date" className="w-full" value={berita.date} onChange={(e) => setBerita({...berita, date: e.target.value})} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {([1, 2] as const).map((num) => {
              const imgKey = `image${num}` as 'image1' | 'image2';
              const imgSrc = berita[imgKey];
              return (
                <div key={num} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm">Gambar {num}</Label>
                    {imgSrc && (
                      <button type="button" onClick={(e) => handleDeleteImage(num, e)} className="text-xs text-red-500 hover:underline">Hapus</button>
                    )}
                  </div>
                  <div
                    className="w-full h-40 border-2 border-dashed rounded-lg flex flex-col items-center justify-center cursor-pointer bg-slate-50 hover:bg-slate-100 overflow-hidden relative group"
                    onClick={() => document.getElementById(`img-upload-${num}`)?.click()}
                  >
                    {imgSrc ? (
                      <img src={imgSrc} className="w-full h-full object-cover" alt={`Gambar ${num}`} />
                    ) : (
                      <div className="text-center text-slate-400 p-2">
                        <UploadCloud size={24} className="mx-auto mb-1" />
                        <span className="text-[10px]">Tap untuk upload</span>
                      </div>
                    )}
                  </div>
                  <input type="file" id={`img-upload-${num}`} className="hidden" accept="image/*" onChange={(e) => handleImageUpload(num, e)} />
                </div>
              );
            })}
          </div>

          <div className="space-y-4 pt-4 border-t">
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-3">
              <Label className="font-semibold text-sm">Isi Berita (Per Paragraf)</Label>
              <Button type="button" variant="outline" size="sm" className="w-full sm:w-auto" onClick={addParagraph}>
                <Plus size={16} className="mr-2" /> Tambah Paragraf
              </Button>
            </div>

            {berita.content.map((para, index) => (
              <div key={index} className="flex gap-2">
                <Textarea
                  className="min-h-[120px] text-sm"
                  value={para}
                  onChange={(e) => updateParagraph(index, e.target.value)}
                  placeholder={`Paragraf ${index + 1}`}
                />
                <button 
                  className="text-slate-400 hover:text-red-500 p-2" 
                  onClick={() => removeParagraph(index)}
                >
                  <Trash2 size={20} />
                </button>
              </div>
            ))}
          </div>

          <div className="flex flex-col-reverse sm:flex-row gap-3 pt-4 border-t">
            <Button variant="outline" className="w-full" onClick={() => navigate({ to: '/admin-konten/informasi/berita' })}>Batal</Button>
            <Button className="w-full bg-slate-900 gap-2" onClick={handleSave} disabled={saving}>
              {saving ? <Loader2 className="animate-spin" /> : <Save size={16} />} Simpan Perubahan
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}