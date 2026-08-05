import React, { useState, useEffect } from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Save, Loader2, Image as ImageIcon, UploadCloud, Trash2 } from "lucide-react";

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api').replace(/\/api$/, '');

export const Route = createFileRoute('/_adminkonten/admin-konten/tentang/organisasi')({
  component: OrganisasiEditor,
});

function OrganisasiEditor() {
  const [data, setData] = useState<any>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/get_organisasi.php`)
      .then(res => res.json())
      .then(res => {
        setData(res.status === 'success' ? res.data : {
          title: "ORGANISASI",
          subtitle: "Struktur & Pengurus",
          bg_image: null,
          org_image: null
        });
      });
  }, []);

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>, field: string) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => setData({ ...data, [field]: e.target?.result });
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    const response = await fetch(`${API_BASE_URL}/api/save_organisasi.php`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    const result = await response.json();
    alert(result.status === 'success' ? "Berhasil disimpan!" : "Gagal");
    setSaving(false);
  };

  if (!data) return <div className="p-10 text-center">Loading...</div>;

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-8 color:grey">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Manajemen Organisasi</h1>
        <Button onClick={handleSave} disabled={saving}>
          {saving ? <Loader2 className="animate-spin mr-2" /> : <Save className="mr-2 h-4" />} Simpan
        </Button>
      </div>

      {/* Hero Header */}
      <Card>
        <CardHeader><CardTitle>Pengaturan Hero Header</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <Input placeholder="Judul" value={data.title} onChange={(e) => setData({ ...data, title: e.target.value })} />
          <Input placeholder="Subtitle" value={data.subtitle} onChange={(e) => setData({ ...data, subtitle: e.target.value })} />
          
          <div className="relative group h-32 border-2 border-dashed rounded-lg flex items-center justify-center cursor-pointer hover:bg-slate-50" onClick={() => document.getElementById('bg-upload')?.click()}>
            {data.bg_image ? (
                <>
                    <img src={data.bg_image.startsWith('data') ? data.bg_image : `${API_BASE_URL}/uploads/${data.bg_image}`} className="h-full w-full object-cover rounded-lg" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center rounded-lg">
                        <Button variant="destructive" size="sm" onClick={(e) => { e.stopPropagation(); setData({ ...data, bg_image: null }); }}><Trash2 size={16}/></Button>
                    </div>
                </>
            ) : <span className="text-slate-400">Upload Background Header</span>}
          </div>
          <input type="file" id="bg-upload" className="hidden" onChange={(e) => handleUpload(e, 'bg_image')} />
        </CardContent>
      </Card>

      {/* Struktur Organisasi */}
      <Card>
        <CardHeader><CardTitle>Gambar Struktur Organisasi</CardTitle></CardHeader>
        <CardContent>
          <div className="relative group w-full min-h-[300px] border-2 border-dashed rounded-lg flex flex-col items-center justify-center cursor-pointer hover:bg-slate-50" onClick={() => document.getElementById('org-upload')?.click()}>
            {data.org_image ? (
                <>
                    <img src={data.org_image.startsWith('data') ? data.org_image : `${API_BASE_URL}/uploads/${data.org_image}`} className="max-h-[500px] object-contain p-2" />
                    <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100">
                        <Button variant="destructive" size="icon" onClick={(e) => { e.stopPropagation(); setData({ ...data, org_image: null }); }}><Trash2 size={16}/></Button>
                    </div>
                </>
            ) : (
                <><UploadCloud size={48} className="text-slate-400" /><p className="text-slate-500">Upload Gambar Struktur</p></>
            )}
          </div>
          <input type="file" id="org-upload" className="hidden" onChange={(e) => handleUpload(e, 'org_image')} />
        </CardContent>
      </Card>
    </div>
  );
}