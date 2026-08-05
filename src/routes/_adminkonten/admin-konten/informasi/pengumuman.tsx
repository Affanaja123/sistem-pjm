import React, { useState, useEffect } from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Save, Upload, Link as LinkIcon, Loader2, Trash2, Edit2 } from "lucide-react";

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api').replace(/\/api$/, '');

export const Route = createFileRoute('/_adminkonten/admin-konten/informasi/pengumuman')({
    component: PengumumanEditor,
});

function PengumumanEditor() {
    const [data, setData] = useState({ title: "", date: "", type: "file" as "file" | "link", file: null as File | null, link: "" });
    const [list, setList] = useState<any[]>([]);
    const [loading, setLoading] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);

    const fetchData = () => {
        fetch(`${API_BASE_URL}/api/get_pengumuman.php`)
            .then(res => res.json())
            .then(res => {
                const items = res.data || res.result || res;
                setList(Array.isArray(items) ? items : []);
            })
            .catch(err => console.error("Gagal memuat:", err));
    };

    useEffect(() => { fetchData(); }, []);

    const handleSave = async () => {
        setLoading(true);
        const formData = new FormData();
        if (editingId) formData.append('id', editingId);
        formData.append('title', data.title);
        formData.append('date', data.date);
        formData.append('type', data.type);
        data.type === 'file' && data.file ? formData.append('file', data.file) : formData.append('link', data.link);

        await fetch(`${API_BASE_URL}/api/save_pengumuman.php`, { method: 'POST', body: formData });

        setLoading(false);
        setData({ title: "", date: "", type: "file", file: null, link: "" });
        setEditingId(null);
        fetchData();
    };

    const startEdit = (item: any) => {
        const itemId = item._id || item.id || item.createdAt;
        if (!itemId) return;
        setEditingId(String(itemId));
        setData({
            title: item.title || item.judul || "",
            date: item.date || item.tanggal || "",
            type: item.type || item.tipe || "file",
            file: null,
            link: item.link || item.url_link || ""
        });
        window.scrollTo({ top: 0, behavior: 'smooth' });
    };

    const handleDelete = async (item: any, indexToRemove: number) => {
        const confirmDelete = window.confirm("Apakah Anda yakin ingin menghapus pengumuman ini?");
        if (!confirmDelete) return;

        const targetId = item._id || item.id;

        // Hilangkan dari UI sementara
        setList((prevList) => prevList.filter((_, index) => index !== indexToRemove));

        if (targetId) {
            try {
                // Tembak endpoint hapus Express & PHP compatibility
                await fetch(`${API_BASE_URL}/api/delete_pengumuman.php?id=${targetId}`, { method: 'DELETE' });
                await fetch(`${API_BASE_URL}/api/content/pengumuman/${targetId}`, { method: 'DELETE' });
                
                alert("Pengumuman berhasil dihapus dari database!");
                fetchData();
            } catch (err) {
                console.error("Gagal menghapus pengumuman:", err);
                alert("Gagal menghapus dari database.");
                fetchData();
            }
        } else {
            fetchData();
        }
    };

    return (
        <div className="p-4 md:p-8 max-w-4xl mx-auto space-y-6">
            <div className="flex flex-col gap-1">
                <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-900">Kelola Pengumuman</h1>
            </div>

            <Card className="border-slate-200 shadow-sm">
                <CardHeader className="border-b bg-slate-50/50 p-4 md:p-6">
                    <CardTitle className="text-base md:text-lg">
                        {editingId ? "Edit Pengumuman" : "Tambah Pengumuman Baru"}
                    </CardTitle>
                </CardHeader>
                <CardContent className="p-4 md:p-6 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label className="text-sm">Judul</Label>
                            <Input value={data.title} onChange={(e) => setData({ ...data, title: e.target.value })} />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-sm">Tanggal</Label>
                            <Input type="date" value={data.date} onChange={(e) => setData({ ...data, date: e.target.value })} />
                        </div>
                    </div>

                    <div className="space-y-4 pt-2">
                        <Label className="text-sm font-semibold">Tipe Konten</Label>
                        <div className="grid grid-cols-2 gap-3">
                            <button type="button" onClick={() => setData({ ...data, type: 'file' })} className={`flex flex-col items-center justify-center p-3 border rounded-xl transition-all ${data.type === 'file' ? 'bg-blue-50 border-blue-500 ring-1 ring-blue-500' : 'hover:bg-slate-50'}`}>
                                <Upload className="mb-1 h-5 w-5 text-slate-600" />
                                <span className="text-xs font-medium">File</span>
                            </button>
                            <button type="button" onClick={() => setData({ ...data, type: 'link' })} className={`flex flex-col items-center justify-center p-3 border rounded-xl transition-all ${data.type === 'link' ? 'bg-blue-50 border-blue-500 ring-1 ring-blue-500' : 'hover:bg-slate-50'}`}>
                                <LinkIcon className="mb-1 h-5 w-5 text-slate-600" />
                                <span className="text-xs font-medium">Link</span>
                            </button>
                        </div>

                        <div className="mt-4 p-3 rounded-lg bg-slate-50 border border-slate-200">
                            {data.type === 'file' ? (
                                <div className="space-y-2">
                                    <Label className="text-[10px] uppercase font-bold text-slate-500">Pilih Dokumen</Label>
                                    <Input type="file" className="bg-white text-sm" onChange={(e) => setData({ ...data, file: e.target.files?.[0] || null })} />
                                </div>
                            ) : (
                                <div className="space-y-2">
                                    <Label className="text-[10px] uppercase font-bold text-slate-500">URL Tautan</Label>
                                    <Input value={data.link} className="bg-white text-sm" onChange={(e) => setData({ ...data, link: e.target.value })} placeholder="https://..." />
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="flex flex-col gap-2">
                        <Button className="w-full" onClick={handleSave} disabled={loading}>
                            {loading ? <Loader2 className="animate-spin mr-2" /> : <Save className="mr-2 h-4 w-4" />}
                            {editingId ? "Update" : "Simpan"}
                        </Button>
                        {editingId && (
                            <Button variant="ghost" className="w-full text-xs" onClick={() => { setEditingId(null); setData({ title: "", date: "", type: "file", file: null, link: "" }); }}>
                                Batal Edit
                            </Button>
                        )}
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="p-4"><CardTitle className="text-base">Daftar Pengumuman</CardTitle></CardHeader>
                <CardContent className="p-0">
                    <div className="divide-y divide-slate-100">
                        {list.length === 0 ? (
                            <p className="p-4 text-center text-sm text-slate-500">Belum ada data pengumuman.</p>
                        ) : (
                            list.map((item, index) => {
                                const rowKey = item._id || item.id || item.createdAt || `pengumuman-${index}`;
                                const itemTitle = item.title || item.judul || "Tanpa Judul";
                                const itemDate = item.date || item.tanggal || "";
                                const itemType = item.type || item.tipe || "file";

                                return (
                                    <div key={rowKey} className="flex justify-between items-center p-4 hover:bg-slate-50 transition-colors">
                                        <div className="truncate pr-4">
                                            <p className="font-medium text-sm truncate">{itemTitle}</p>
                                            <p className="text-[11px] text-slate-500">{itemDate} • {itemType}</p>
                                        </div>
                                        <div className="flex gap-1 shrink-0">
                                            <Button variant="ghost" size="sm" onClick={() => startEdit(item)}><Edit2 size={16} /></Button>
                                            <Button variant="ghost" size="sm" className="text-red-500" onClick={() => handleDelete(item, index)}><Trash2 size={16} /></Button>
                                        </div>
                                    </div>
                                );
                            })
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}