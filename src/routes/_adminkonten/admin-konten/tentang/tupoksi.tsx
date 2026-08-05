import React, { useState, useEffect } from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Trash2, UploadCloud, Save, Loader2, X } from "lucide-react";

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api').replace(/\/api$/, '');

export const Route = createFileRoute('/_adminkonten/admin-konten/tentang/tupoksi')({
  component: TupoksiEditor,
});

function TupoksiEditor() {
  const [data, setData] = useState({
    title: "",
    subtitle: "",
    tugas_pokok: [] as string[],
    fungsi: [] as string[],
    bg_image: null as string | null
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/get_tupoksi.php`)
      .then(res => res.json())
      .then(res => {
        if (res.status === 'success' && res.data) {
          setData({
            title: res.data.title || "",
            subtitle: res.data.subtitle || "",
            tugas_pokok: res.data.tugas_pokok ? res.data.tugas_pokok.split('\n') : [""],
            fungsi: res.data.fungsi ? res.data.fungsi.split('\n') : [""],
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
    const payload = {
      title: data.title,
      subtitle: data.subtitle,
      tugas_pokok: data.tugas_pokok.join('\n'),
      fungsi: data.fungsi.join('\n'),
      bg_image: data.bg_image
    };

    try {
      const response = await fetch(`${API_BASE_URL}/api/save_tupoksi.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const result = await response.json();
      if (result.status === 'success') alert("Berhasil disimpan!");
      else alert("Gagal: " + result.message);
    } catch (err) {
      alert("Error saat menyimpan.");
    } finally {
      setSaving(false);
    }
  };

  const addField = (type: 'fungsi') => setData({ ...data, [type]: [...data[type], ""] });
  const updateField = (type: 'tugas_pokok' | 'fungsi', index: number, value: string) => {
    const newList = [...data[type]];
    newList[index] = value;
    setData({ ...data, [type]: newList });
  };
  const removeField = (type: 'fungsi', index: number) => {
    setData({ ...data, [type]: data[type].filter((_, i) => i !== index) });
  };

  if (loading) return <div className="p-8">Memuat data...</div>;

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-8 bg-slate-50/50 min-h-screen">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Edit TUPOKSI</h1>
          <p className="text-slate-500 mt-1">Kelola tugas pokok dan fungsi organisasi.</p>
        </div>
        <Button onClick={handleSave} disabled={saving} className="bg-slate-900 text-white shadow-lg w-full sm:w-auto">
          {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />} Simpan
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
              <Label className="text-[11px] font-bold text-slate-500 uppercase">Judul Utama</Label>
              <Input value={data.title} onChange={(e) => setData({ ...data, title: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-[11px] font-bold text-slate-500 uppercase">Subtitle</Label>
              <Input value={data.subtitle} onChange={(e) => setData({ ...data, subtitle: e.target.value })} />
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-slate-200 shadow-sm">
          <CardHeader className="bg-white border-b py-4 px-6"><CardTitle className="text-lg">Tugas Pokok</CardTitle></CardHeader>
          <CardContent className="p-6">
            <Textarea 
              className="min-h-[200px] w-full" 
              value={data.tugas_pokok.join('\n')} 
              onChange={(e) => setData({ ...data, tugas_pokok: e.target.value.split('\n') })}
            />
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-sm">
          <CardHeader className="bg-white border-b py-4 px-6 flex flex-row justify-between items-center">
            <CardTitle className="text-lg">Fungsi</CardTitle>
            <Button variant="outline" size="sm" onClick={() => addField('fungsi')}><Plus className="h-4 w-4" /></Button>
          </CardHeader>
          <CardContent className="p-6 space-y-3">
            {data.fungsi.map((item, index) => (
              <div key={index} className="flex gap-2">
                <Input value={item} onChange={(e) => updateField('fungsi', index, e.target.value)} />
                <Button variant="ghost" size="icon" className="text-slate-300 hover:text-red-500 shrink-0" onClick={() => removeField('fungsi', index)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}