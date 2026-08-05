import React, { useState, useEffect } from 'react';
import { createFileRoute, useNavigate } from '@tanstack/react-router';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Trash2, Eye, Save, Loader2, UploadCloud, Check } from "lucide-react";

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api').replace(/\/api$/, '');

export const Route = createFileRoute('/_adminkonten/admin-konten/informasi/berita')({
  component: BeritaEditor,
});

// Berita yang sudah ada di DB (dari get_berita)
type DbBerita = {
  id: number;
  judul: string;
  ringkasan: string;
  tanggal: string;
  thumbnail: string | null;
};

// Berita baru yang belum disimpan
type NewBerita = {
  _tempId: number;
  is_new: true;
  judul: string;
  ringkasan: string;
  tanggal: string;
  thumbnail: string | null;
};

function BeritaEditor() {
  const navigate = useNavigate();
  // Pisahkan state: data dari DB dan data baru yang belum tersimpan
  const [dbItems, setDbItems] = useState<DbBerita[]>([]);
  const [newItems, setNewItems] = useState<NewBerita[]>([]);
  const [savingNew, setSavingNew] = useState(false);
  const [savingId, setSavingId] = useState<number | null>(null); // id yg sedang di-update

  const fetchBerita = () => {
    fetch(`${API_BASE_URL}/api/get_berita.php`)
      .then(res => res.json())
      .then(res => {
        if (res.status === 'success') {
          setDbItems(res.data ?? []);
        }
      });
  };

  useEffect(() => {
    fetchBerita();
  }, []);

  // ── Update item dari DB ──────────────────────────────────
  const updateDbItem = (id: number, field: string, value: any) => {
    setDbItems(prev => prev.map(item => item.id === id ? { ...item, [field]: value } : item));
  };

  const handleImageUploadDb = (id: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => updateDbItem(id, 'thumbnail', ev.target?.result);
      reader.readAsDataURL(file);
    }
  };

  // Simpan perubahan satu item yang sudah ada di DB
  const handleUpdateItem = async (item: DbBerita) => {
    if (!item.judul?.trim()) { alert("Judul tidak boleh kosong."); return; }
    setSavingId(item.id);
    try {
      const res = await fetch(`${API_BASE_URL}/api/save_berita.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...item, is_new: false }) // pastikan is_new = false → UPDATE
      });
      const result = await res.json();
      if (result.status === 'success') {
        alert("Berita berhasil diperbarui!");
        fetchBerita();
      }
    } catch { alert("Gagal menghubungi server."); }
    finally { setSavingId(null); }
  };

  const handleDeleteDb = async (id: number) => {
    if (!confirm("Hapus berita ini?")) return;
    await fetch(`${API_BASE_URL}/api/delete_berita.php`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id })
    });
    fetchBerita();
  };

  // ── Berita baru (belum ada di DB) ───────────────────────
  const updateNewItem = (tempId: number, field: string, value: any) => {
    setNewItems(prev => prev.map(item => item._tempId === tempId ? { ...item, [field]: value } : item));
  };

  const handleImageUploadNew = (tempId: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => updateNewItem(tempId, 'thumbnail', ev.target?.result);
      reader.readAsDataURL(file);
    }
  };

  const addBerita = () => {
    setNewItems(prev => [
      { _tempId: Date.now(), is_new: true, judul: "", ringkasan: "", tanggal: "", thumbnail: null },
      ...prev
    ]);
  };

  const removeNewItem = (tempId: number) => {
    setNewItems(prev => prev.filter(item => item._tempId !== tempId));
  };

  // Simpan hanya item baru — INSERT ke DB
  const handleSaveNew = async () => {
    const emptyItems = newItems.filter(item => !item.judul?.trim());
    if (emptyItems.length > 0) {
      alert("Harap isi judul untuk semua berita baru sebelum menyimpan.");
      return;
    }
    if (newItems.length === 0) { alert("Tidak ada berita baru."); return; }

    setSavingNew(true);
    try {
      for (const item of newItems) {
        await fetch(`${API_BASE_URL}/api/save_berita.php`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          // Kirim is_new: true → PHP akan INSERT
          body: JSON.stringify({ is_new: true, judul: item.judul, ringkasan: item.ringkasan, tanggal: item.tanggal, thumbnail: item.thumbnail })
        });
      }
      alert("Berita baru berhasil disimpan!");
      setNewItems([]); // kosongkan form baru
      fetchBerita();   // reload dari DB
    } catch { alert("Gagal menyimpan, cek koneksi server."); }
    finally { setSavingNew(false); }
  };

  // Helper: render thumbnail upload box
  const ThumbnailBox = ({ thumbnail, inputId, onImageChange }: { thumbnail: string | null; inputId: string; onImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void }) => (
    <div className="md:col-span-3 space-y-1">
      <Label className="text-[10px] font-bold text-slate-400 uppercase">Thumbnail</Label>
      <div
        className="w-full h-20 border-2 border-dashed rounded-lg flex items-center justify-center cursor-pointer hover:bg-slate-100 overflow-hidden"
        onClick={() => document.getElementById(inputId)?.click()}
      >
        {thumbnail ? (
          <img
            src={typeof thumbnail === 'string' && thumbnail.startsWith('data') ? thumbnail : `${API_BASE_URL}/uploads/${thumbnail}`}
            className="h-full w-full object-cover"
            alt="thumbnail"
          />
        ) : (
          <div className="flex flex-col items-center gap-1 text-slate-400">
            <UploadCloud size={20} />
            <span className="text-[10px]">Upload gambar</span>
          </div>
        )}
      </div>
      <input type="file" id={inputId} className="hidden" accept="image/*" onChange={onImageChange} />
    </div>
  );

  return (
    <div className="p-4 md:p-8 max-w-6xl mx-auto space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Manajemen Berita</h1>
          <p className="text-slate-500 mt-1">Kelola publikasi dan gambar berita terbaru.</p>
        </div>
      </div>

      {/* ── Berita Baru (form INSERT) ── */}
      <Card className="border-slate-200">
        <CardHeader className="flex flex-row justify-between items-center bg-slate-50 rounded-t-lg border-b border-slate-200">
          <div>
            <CardTitle className="text-base text-slate-800">Tambah Berita Baru</CardTitle>
            <p className="text-xs text-slate-500 mt-0.5">Form di bawah akan disimpan ke database saat klik Simpan</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={addBerita} className="border-slate-300 text-slate-700 hover:bg-slate-100">
              <Plus className="mr-1.5 h-3.5 w-3.5" /> Tambah Baru
            </Button>
            {newItems.length > 0 && (
              <Button size="sm" onClick={handleSaveNew} disabled={savingNew} className="bg-slate-800 hover:bg-slate-900 text-white">
                {savingNew ? <Loader2 className="animate-spin mr-1.5 h-3.5 w-3.5" /> : <Save className="mr-1.5 h-3.5 w-3.5" />}
                Simpan ({newItems.length})
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="p-0">
          {newItems.length === 0 && (
            <div className="p-8 text-center text-slate-400 text-sm">
              Klik "Tambah Baru" untuk menambahkan berita.
            </div>
          )}
          {newItems.map((item) => (
            <div key={item._tempId} className="grid grid-cols-1 md:grid-cols-12 gap-4 px-4 py-3 border-b border-slate-100 items-center bg-white hover:bg-slate-50">
              <div className="md:col-span-4 space-y-2">
                <div className="space-y-1">
                  <Label className="text-[10px] font-bold text-slate-400 uppercase">Judul Berita *</Label>
                  <Input value={item.judul} onChange={(e) => updateNewItem(item._tempId, 'judul', e.target.value)} placeholder="Masukkan judul..." className="h-8 text-sm" />
                </div>
                <div className="space-y-1">
                  <Label className="text-[10px] font-bold text-slate-400 uppercase">Tanggal</Label>
                  <Input type="date" value={item.tanggal} onChange={(e) => updateNewItem(item._tempId, 'tanggal', e.target.value)} className="h-8 text-sm" />
                </div>
              </div>
              <div className="md:col-span-4 space-y-1">
                <Label className="text-[10px] font-bold text-slate-400 uppercase">Ringkasan</Label>
                <Textarea className="h-20 text-sm" value={item.ringkasan} onChange={(e) => updateNewItem(item._tempId, 'ringkasan', e.target.value)} placeholder="Tuliskan ringkasan..." />
              </div>
              <ThumbnailBox
                thumbnail={item.thumbnail}
                inputId={`new-file-${item._tempId}`}
                onImageChange={(e) => handleImageUploadNew(item._tempId, e)}
              />
              <div className="md:col-span-1 flex md:flex-col gap-2 justify-center">
                <Button variant="ghost" size="icon" className="text-slate-400 hover:text-red-500" title="Batalkan" onClick={() => removeNewItem(item._tempId)}>
                  <Trash2 size={18} />
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* ── Berita yang Sudah Ada di DB ── */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Daftar Berita Tersimpan</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {dbItems.length === 0 && (
            <div className="p-8 text-center text-slate-400 text-sm">Belum ada berita tersimpan.</div>
          )}
          {dbItems.map((item) => (
            <div key={item.id} className="grid grid-cols-1 md:grid-cols-12 gap-4 px-4 py-3 border-b border-slate-100 items-center hover:bg-slate-50">
              <div className="md:col-span-4 space-y-2">
                <div className="space-y-1">
                  <Label className="text-[10px] font-bold text-slate-400 uppercase">Judul Berita</Label>
                  <Input value={item.judul || ""} onChange={(e) => updateDbItem(item.id, 'judul', e.target.value)} className="h-8 text-sm" />
                </div>
                <div className="space-y-1">
                  <Label className="text-[10px] font-bold text-slate-400 uppercase">Tanggal</Label>
                  <Input type="date" value={item.tanggal || ""} onChange={(e) => updateDbItem(item.id, 'tanggal', e.target.value)} className="h-8 text-sm" />
                </div>
              </div>
              <div className="md:col-span-4 space-y-1">
                <Label className="text-[10px] font-bold text-slate-400 uppercase">Ringkasan</Label>
                <Textarea className="h-20 text-sm" value={item.ringkasan || ""} onChange={(e) => updateDbItem(item.id, 'ringkasan', e.target.value)} />
              </div>
              <ThumbnailBox
                thumbnail={item.thumbnail}
                inputId={`db-file-${item.id}`}
                onImageChange={(e) => handleImageUploadDb(item.id, e)}
              />
              <div className="md:col-span-1 flex md:flex-col gap-2 justify-center">
                <Button variant="ghost" size="icon" className="text-slate-400 hover:text-green-600" title="Simpan perubahan" onClick={() => handleUpdateItem(item)} disabled={savingId === item.id}>
                  {savingId === item.id ? <Loader2 size={18} className="animate-spin" /> : <Check size={18} />}
                </Button>
                <Button variant="ghost" size="icon" className="text-slate-400 hover:text-blue-600" title="Preview" onClick={() => navigate({ to: '/admin-konten/informasi/detail-berita', search: { id: String(item.id) } })}>
                  <Eye size={18} />
                </Button>
                <Button variant="ghost" size="icon" className="text-slate-400 hover:text-red-500" title="Hapus" onClick={() => handleDeleteDb(item.id)}>
                  <Trash2 size={18} />
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}