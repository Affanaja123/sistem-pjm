import React, { useState, useEffect } from 'react';
import { createFileRoute } from '@tanstack/react-router';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Save, Loader2, Menu as MenuIcon, Plus, Trash2, AlertCircle } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { toast } from "sonner";
import { 
  AlertDialog, 
  AlertDialogAction, 
  AlertDialogCancel, 
  AlertDialogContent, 
  AlertDialogDescription, 
  AlertDialogFooter, 
  AlertDialogHeader, 
  AlertDialogTitle 
} from "@/components/ui/alert-dialog";

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api').replace(/\/api$/, '');

export const Route = createFileRoute('/_adminkonten/admin-konten/kelola-menu')({
  component: AdminKelolaMenu,
});

function AdminKelolaMenu() {
  const [menus, setMenus] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // State untuk Dialog Konfirmasi Hapus Kustom
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ type: 'parent' | 'sub', pIndex: number, sIndex?: number } | null>(null);

  const currentUser: any = getCurrentUser();
  const isSuper = currentUser?.hak_akses && currentUser.hak_akses.toLowerCase().includes("admin_super");
  const userAccessList = currentUser?.hak_akses ? currentUser.hak_akses.toLowerCase().split(",").map((s: string) => s.trim()) : [];

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/get_menus.php`)
      .then(res => res.json())
      .then(res => {
        if (res.status === 'success' && res.data) {
          setMenus(res.data);
        }
        setLoading(false);
      })
      .catch(err => {
        console.error("Gagal memuat menu:", err);
        toast.error("Gagal memuat daftar menu dari server.");
        setLoading(false);
      });
  }, []);

  const handleParentLabelChange = (index: number, newLabel: string) => {
    const updated = [...menus];
    updated[index].label = newLabel;
    setMenus(updated);
  };

  const handleSubLabelChange = (parentIndex: number, subIndex: number, newLabel: string) => {
    const updated = [...menus];
    updated[parentIndex].subItems[subIndex].label = newLabel;
    setMenus(updated);
  };

  const handleAddParentMenu = () => {
    const newMenu = {
      id: 'temp_' + Date.now(),
      label: 'Menu Baru',
      to: '/admin-konten/menu-baru',
      is_system: 0,
      subItems: []
    };
    setMenus([...menus, newMenu]);

    toast.success("Menu baru berhasil ditambahkan!", {
      description: "Silakan gulir ke bawah untuk mengisi nama menu utama.",
    });

    setTimeout(() => {
      window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
    }, 100);
  };

  const promptDeleteParentMenu = (index: number) => {
    const target = menus[index];
    if (target.is_system == 1) {
      toast.error("Menu bawaan sistem tidak dapat dihapus!");
      return;
    }
    setDeleteTarget({ type: 'parent', pIndex: index });
    setDeleteModalOpen(true);
  };

  const handleAddSubMenu = (parentIndex: number) => {
    const updated = [...menus];
    if (!updated[parentIndex].subItems) {
      updated[parentIndex].subItems = [];
    }
    updated[parentIndex].subItems.push({
      id: 'temp_sub_' + Date.now(),
      label: 'Sub Menu Baru',
      to: '/admin-konten/sub-baru',
      is_system: 0
    });
    setMenus(updated);

    toast.success("Sub-menu baru ditambahkan!", {
      description: `Berhasil ditambahkan ke kategori "${updated[parentIndex].label}".`,
    });
  };

  const promptDeleteSubMenu = (parentIndex: number, subIndex: number) => {
    const target = menus[parentIndex].subItems[subIndex];
    if (target.is_system == 1) {
      toast.error("Sub-menu bawaan sistem tidak dapat dihapus!");
      return;
    }
    setDeleteTarget({ type: 'sub', pIndex: parentIndex, sIndex: subIndex });
    setDeleteModalOpen(true);
  };

  const confirmDelete = () => {
    if (!deleteTarget) return;

    if (deleteTarget.type === 'parent') {
      const updated = menus.filter((_, i) => i !== deleteTarget.pIndex);
      setMenus(updated);
      toast.success("Menu utama berhasil dihapus.");
    } else if (deleteTarget.type === 'sub' && deleteTarget.sIndex !== undefined) {
      const updated = [...menus];
      updated[deleteTarget.pIndex].subItems = updated[deleteTarget.pIndex].subItems.filter((_: any, i: number) => i !== deleteTarget.sIndex);
      setMenus(updated);
      toast.success("Sub-menu berhasil dihapus.");
    }

    setDeleteModalOpen(false);
    setDeleteTarget(null);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/save_menus.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          menus, 
          hak_akses: currentUser?.hak_akses || '' 
        })
      });
      const result = await res.json();
      if (result.status === 'success') {
        toast.success("Perubahan menu berhasil disimpan!", {
          description: "Memuat ulang halaman...",
        });
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      } else {
        toast.error("Gagal menyimpan: " + (result.message || "Terjadi kesalahan"));
      }
    } catch (err) {
      console.error(err);
      toast.error("Terjadi kesalahan jaringan saat menyimpan menu.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="p-8 text-center text-sm text-slate-500">Memuat daftar menu...</div>;

  return (
    <div className="w-full max-w-4xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-4 sm:space-y-6 min-h-screen">
      {/* Header Bagian Atas yang Responsif */}
      <div className="flex flex-col gap-4 bg-white p-4 sm:p-5 rounded-2xl border border-slate-100 shadow-sm">
        <div className="space-y-1">
          <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-slate-900 tracking-tight">Kelola Menu & Navbar</h1>
          <p className="text-slate-500 text-xs sm:text-sm">
            {isSuper 
              ? "Tambah, ubah, atau hapus menu utama dan sub-menu sesuai kebutuhan." 
              : "Anda dapat mengubah nama menu yang sesuai dengan hak akses Anda saja."}
          </p>
        </div>
        
        {/* Tombol Aksi Utama (Full width di HP, sejajar di layar besar) */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 pt-1">
          {isSuper && (
            <Button onClick={handleAddParentMenu} variant="outline" className="w-full sm:w-auto text-xs sm:text-sm h-10 border-slate-300 rounded-xl">
              <Plus className="mr-1.5 h-4 w-4" /> Tambah Menu
            </Button>
          )}
          <Button 
            onClick={handleSave} 
            disabled={saving} 
            className="w-full sm:w-auto bg-slate-900 hover:bg-slate-800 text-white text-xs sm:text-sm h-10 shadow-sm rounded-xl"
          >
            {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            {saving ? "Menyimpan..." : "Simpan Perubahan"}
          </Button>
        </div>
      </div>

      {/* Daftar Kartu Menu */}
      <div className="space-y-3 sm:space-y-4">
        {menus.map((menu, pIndex) => {
          const canEditThisMenu = isSuper || userAccessList.some((acc: string) => (menu.label || "").toLowerCase().includes(acc));

          return (
            <Card key={menu.id || pIndex} className="border-slate-200 shadow-sm overflow-hidden rounded-2xl">
              <CardHeader className="bg-slate-50/80 border-b py-3 px-4 sm:px-6 flex flex-row items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0 pr-2">
                  <MenuIcon className="h-4 w-4 sm:h-5 sm:w-5 text-slate-400 shrink-0" />
                  <CardTitle className="text-sm sm:text-base font-semibold text-slate-800 truncate">{menu.label}</CardTitle>
                </div>
                <div className="flex items-center shrink-0">
                  {menu.is_system == 1 ? (
                    <span className="text-[10px] sm:text-xs bg-slate-200 text-slate-600 px-2 py-0.5 rounded-full font-medium">
                      Sistem
                    </span>
                  ) : (
                    isSuper && (
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => promptDeleteParentMenu(pIndex)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50 h-8 px-2 text-xs rounded-lg"
                      >
                        <Trash2 className="h-3.5 w-3.5 sm:mr-1" />
                        <span className="hidden sm:inline">Hapus Menu</span>
                      </Button>
                    )
                  )}
                </div>
              </CardHeader>
              <CardContent className="p-4 sm:p-6 space-y-4">
                <div className="space-y-1.5">
                  <Label className="text-[10px] sm:text-[11px] font-bold text-slate-500 uppercase tracking-wider">Label / Nama Menu Utama</Label>
                  <Input
                    value={menu.label}
                    disabled={!isSuper && !canEditThisMenu}
                    onChange={(e) => handleParentLabelChange(pIndex, e.target.value)}
                    placeholder="Nama Menu Utama"
                    className="h-9 sm:h-10 text-xs sm:text-sm rounded-xl"
                  />
                </div>

                <div className="mt-3 pt-3 border-t border-slate-100 space-y-3">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                    <Label className="text-[11px] sm:text-xs font-semibold text-slate-600">Sub-Menu di dalam kategori ini:</Label>
                    {isSuper && (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        onClick={() => handleAddSubMenu(pIndex)}
                        className="w-full sm:w-auto h-7 text-[11px] px-2.5 text-slate-700 rounded-lg"
                      >
                        <Plus className="h-3 w-3 mr-1" /> Tambah Sub-Menu
                      </Button>
                    )}
                  </div>

                  {/* Grid Sub Menu: 1 kolom di HP, 2 kolom di tablet/desktop */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pl-0 sm:pl-3 sm:border-l-2 sm:border-slate-200">
                    {menu.subItems && menu.subItems.map((sub: any, sIndex: number) => {
                      const canEditSub = isSuper || userAccessList.some((acc: string) => (sub.label || "").toLowerCase().includes(acc)) || canEditThisMenu;

                      return (
                        <div key={sub.id || sIndex} className="space-y-1.5 bg-slate-50/50 p-3 rounded-xl border border-slate-100">
                          <div className="flex justify-between items-center">
                            <Label className="text-[9px] sm:text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                              Sub-Menu {sIndex + 1}
                            </Label>
                            {sub.is_system != 1 && isSuper && (
                              <button 
                                onClick={() => promptDeleteSubMenu(pIndex, sIndex)}
                                className="text-red-500 hover:text-red-700 text-[10px] font-medium flex items-center py-0.5 px-1 rounded transition-colors"
                                type="button"
                              >
                                <Trash2 className="h-3 w-3 mr-0.5" /> Hapus
                              </button>
                            )}
                          </div>
                          <Input
                            value={sub.label}
                            disabled={!canEditSub}
                            onChange={(e) => handleSubLabelChange(pIndex, sIndex, e.target.value)}
                            placeholder="Nama Sub-Menu"
                            className="h-8 sm:h-9 text-xs sm:text-sm bg-white rounded-lg"
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Dialog Konfirmasi Hapus */}
      <AlertDialog open={deleteModalOpen} onOpenChange={setDeleteModalOpen}>
        <AlertDialogContent className="w-[90vw] max-w-md rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-destructive text-base sm:text-lg">
              <AlertCircle className="h-5 w-5 shrink-0" />
              Konfirmasi Penghapusan
            </AlertDialogTitle>
            <AlertDialogDescription className="text-xs sm:text-sm">
              {deleteTarget?.type === 'parent' 
                ? "Apakah Anda yakin ingin menghapus menu utama ini beserta seluruh sub-menunya? Tindakan ini tidak dapat dibatalkan." 
                : "Apakah Anda yakin ingin menghapus sub-menu ini?"}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="flex-col sm:flex-row gap-2">
            <AlertDialogCancel className="w-full sm:w-auto rounded-xl m-0">Batal</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDelete}
              className="w-full sm:w-auto bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-xl m-0"
            >
              Ya, Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}