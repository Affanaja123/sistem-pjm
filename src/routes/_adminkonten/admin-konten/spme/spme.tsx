import React, { useState, useEffect } from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Save, Loader2, Trash2, UploadCloud } from "lucide-react";

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api').replace(/\/api$/, '');

export const Route = createFileRoute('/_adminkonten/admin-konten/spme/spme')({
  component: SpmeEditor,
});

function SpmeEditor() {
  const [data, setData] = useState<any>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/get_spme.php`)
      .then(res => res.json())
      .then(res => setData(res.data))
      .catch(err => console.error("Error Detail:", err));
  }, []);

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => setData((prev: any) => ({ ...prev, bg_image: e.target?.result }));
      reader.readAsDataURL(file);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await fetch(`${API_BASE_URL}/api/save_spme.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      const result = await response.json();
      alert(result.status === 'success' ? "Berhasil disimpan!" : "Gagal: " + (result.message || "Unknown error"));
    } catch (err) {
      alert("Gagal menghubungi server");
    } finally {
      setSaving(false);
    }
  };

  if (!data) return <div className="p-10 text-center text-slate-500">Memuat data...</div>;

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <h1 className="text-2xl font-bold">Manajemen SPME</h1>
        <Button className="w-full sm:w-auto" onClick={handleSave} disabled={saving}>
          {saving ? <Loader2 className="animate-spin mr-2" /> : <Save className="mr-2 h-4 w-4" />} 
          Simpan
        </Button>
      </div>

      <Card className="shadow-sm">
        <CardHeader className="p-4 md:p-6 border-b">
          <CardTitle className="text-lg">Pengaturan Hero Header SPME</CardTitle>
        </CardHeader>
        <CardContent className="p-4 md:p-6 space-y-4">
          <div className="space-y-2">
            <Label className="text-sm font-medium">Judul</Label>
            <Input
              placeholder="Masukkan judul..."
              value={data.title || ""}
              onChange={(e) => setData({ ...data, title: e.target.value })}
            />
          </div>
          
          <div className="space-y-2">
            <Label className="text-sm font-medium">Subtitle</Label>
            <Input
              placeholder="Masukkan subtitle..."
              value={data.subtitle || ""}
              onChange={(e) => setData({ ...data, subtitle: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label className="text-sm font-medium">Gambar Latar (Background)</Label>
            <div
              className="relative h-48 w-full border-2 border-dashed rounded-lg flex items-center justify-center cursor-pointer overflow-hidden group bg-slate-50 hover:bg-slate-100 transition-colors"
              onClick={() => document.getElementById('bg-upload')?.click()}
            >
              {data.bg_image ? (
                <>
                  <img
                    src={typeof data.bg_image === 'string' && data.bg_image.startsWith('data')
                      ? data.bg_image
                      : `${API_BASE_URL}/uploads/${data.bg_image}`}
                    className="w-full h-full object-cover"
                    alt="Hero background"
                  />
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      variant="destructive"
                      size="sm"
                      className="shadow-lg"
                      onClick={(e) => { e.stopPropagation(); setData({ ...data, bg_image: null }); }}
                    >
                      <Trash2 size={16} className="mr-2" /> Hapus
                    </Button>
                  </div>
                </>
              ) : (
                <div className="text-center p-4 text-slate-400">
                  <UploadCloud size={32} className="mx-auto mb-2" />
                  <span className="text-xs">Klik untuk upload background</span>
                </div>
              )}
            </div>
            <input type="file" id="bg-upload" className="hidden" accept="image/*" onChange={handleUpload} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}