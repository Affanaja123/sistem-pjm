import React, { useState, useEffect } from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Trash2, UploadCloud, FileText, Link as LinkIcon, Save, Loader2, X } from "lucide-react";

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api').replace(/\/api$/, '');

export const Route = createFileRoute('/_adminkonten/admin-konten/dokumen/peraturan-uud')({
  component: PeraturanUudEditor,
});

function PeraturanUudEditor() {
  const [data, setData] = useState({
    title: "PERATURAN UUD & REGULASI",
    subtitle: "Dokumen Dasar Hukum Penjaminan Mutu",
    bg_image: null as string | null,
    documents: [] as { id: number, name: string, description: string, links: { id: number, label: string, url: string }[] }[]
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/get_peraturan.php`)
      .then(res => res.json())
      .then(res => {
        if (res.status === 'success' && res.data) {
          setData({
            title: res.data.title,
            subtitle: res.data.subtitle,
            bg_image: res.data.bg_image || res.data.bg_url || null,
            documents: res.data.documents || []
          });
        }
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
    try {
      const response = await fetch(`${API_BASE_URL}/api/save_peraturan.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      const result = await response.json();
      alert(result.status === 'success' ? "Data berhasil disimpan!" : "Gagal: " + result.message);
    } finally { setSaving(false); }
  };

  const addDoc = () => setData({ ...data, documents: [...data.documents, { id: Date.now(), name: "", description: "", links: [] }] });
  const addLink = (docIndex: number) => {
    const newDocs = [...data.documents];
    newDocs[docIndex].links.push({ id: Date.now(), label: "", url: "" });
    setData({ ...data, documents: newDocs });
  };

  const updateDoc = (index: number, field: 'name' | 'description', value: string) => {
    const newDocs = [...data.documents];
    newDocs[index][field] = value;
    setData({ ...data, documents: newDocs });
  };

  const updateLink = (docIndex: number, linkIndex: number, field: 'label' | 'url', value: string) => {
    const newDocs = [...data.documents];
    newDocs[docIndex].links[linkIndex][field] = value;
    setData({ ...data, documents: newDocs });
  };

  const removeDoc = (index: number) => setData({ ...data, documents: data.documents.filter((_, i) => i !== index) });
  const removeLink = (docIndex: number, linkIndex: number) => {
    const newDocs = [...data.documents];
    newDocs[docIndex].links.splice(linkIndex, 1);
    setData({ ...data, documents: newDocs });
  };

  return (
    <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-8 bg-slate-50/50 min-h-screen">
      <div className="flex justify-between items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Peraturan & Regulasi</h1>
          <p className="text-slate-500 mt-1">Kelola dokumen dasar hukum dan regulasi.</p>
        </div>
        <Button onClick={handleSave} disabled={saving} className="bg-slate-900 text-white shadow-lg">
          {saving ? <Loader2 className="animate-spin mr-2" /> : <Save className="mr-2 h-4 w-4" />} Simpan
        </Button>
      </div>

      <Card>
        <CardHeader><CardTitle>Header Section</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label>Background Header</Label>
            {data.bg_image ? (
                <div className="relative h-24 border rounded-lg overflow-hidden cursor-pointer">
                    <img src={data.bg_image?.startsWith('data:') ? data.bg_image : `${API_BASE_URL}/uploads/${data.bg_image}`} className="w-full h-full object-cover" />
                    <Button variant="destructive" size="icon" className="absolute top-1 right-1 h-6 w-6" onClick={() => setData({...data, bg_image: null})}><X size={12}/></Button>
                </div>
            ) : (
                <Button variant="outline" className="w-full h-24 border-dashed" onClick={() => document.getElementById('bg-upload')?.click()}>
                    <UploadCloud className="mr-2" /> Upload Background
                </Button>
            )}
            <input type="file" id="bg-upload" className="hidden" accept="image/*" onChange={handleImageChange} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Input placeholder="Judul" value={data.title} onChange={(e) => setData({ ...data, title: e.target.value })} />
            <Input placeholder="Subtitle" value={data.subtitle} onChange={(e) => setData({ ...data, subtitle: e.target.value })} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row justify-between items-center">
            <CardTitle>Daftar Dokumen</CardTitle>
            <Button variant="outline" size="sm" onClick={addDoc}><Plus className="mr-2 h-4 w-4" /> Tambah Dokumen</Button>
        </CardHeader>
        <CardContent className="space-y-6">
          {data.documents.map((doc, docIndex) => (
            <div key={doc.id} className="border p-4 rounded-lg space-y-4 bg-white">
              <div className="flex gap-4">
                <FileText className="h-5 w-5 text-slate-400 mt-2" />
                <div className="flex-1 space-y-2">
                  <Input placeholder="Judul Dokumen" value={doc.name} onChange={(e) => updateDoc(docIndex, 'name', e.target.value)} />
                  <Textarea placeholder="Deskripsi..." value={doc.description} onChange={(e) => updateDoc(docIndex, 'description', e.target.value)} />
                </div>
                <Button variant="ghost" size="icon" className="text-red-500" onClick={() => removeDoc(docIndex)}><Trash2 size={18} /></Button>
              </div>
              
              <div className="pl-9 border-t pt-4 space-y-2">
                <div className="flex justify-between items-center">
                    <Label className="text-[10px] font-bold uppercase text-slate-500">Daftar Peraturan</Label>
                    <Button variant="ghost" size="sm" onClick={() => addLink(docIndex)}><Plus size={14} className="mr-1" /> Tambah Link</Button>
                </div>
                {doc.links.map((link, linkIndex) => (
                  <div key={link.id} className="flex gap-2">
                    <Input placeholder="Label Link" className="text-sm" value={link.label} onChange={(e) => updateLink(docIndex, linkIndex, 'label', e.target.value)} />
                    <Input placeholder="URL Tujuan" className="text-sm" value={link.url} onChange={(e) => updateLink(docIndex, linkIndex, 'url', e.target.value)} />
                    <Button variant="ghost" size="icon" onClick={() => removeLink(docIndex, linkIndex)}><Trash2 size={16} /></Button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}
