import { useState, useEffect } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Users, ShieldCheck, Plus, Trash2, AlertCircle, Check } from "lucide-react";
import { PageHeader } from "@/components/PageHeader";
import { StatusBadge } from "@/components/StatusBadge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { getAdminKonten, addAdminKonten, updateAdminKonten, deleteAdminKonten, getCurrentUser } from "@/lib/auth";

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api').replace(/\/api$/, '');

export const Route = createFileRoute("/_adminkonten/admin-konten/pengaturan")({
  head: () => ({ meta: [{ title: "Pengaturan Admin Konten — PJM" }] }),
  component: PengaturanPage,
});

function PengaturanPage() {
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [listHakAkses, setListHakAkses] = useState<any[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [userDialogOpen, setUserDialogOpen] = useState(false);
  const [editUserDialogOpen, setEditUserDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [errorDialogOpen, setErrorDialogOpen] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [userToDelete, setUserToDelete] = useState<any | null>(null);
  const [selectedUser, setSelectedUser] = useState<any | null>(null);

  const [userForm, setUserForm] = useState({
    nama: "",
    email: "",
    password: "",
    hak_akses: "",
  });
  const [isAddingUser, setIsAddingUser] = useState(false);
  const isSuperAdmin = currentUser?.hak_akses?.includes('admin_super');

  useEffect(() => {
    setCurrentUser(getCurrentUser());
    fetchUsers();
    fetchMenusForAccess();

    const root = document.documentElement;
    const isDark = localStorage.getItem("darkMode") === "true";
    if (isDark) {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }, []);

  const fetchUsers = async () => {
    setLoadingUsers(true);
    const result = await getAdminKonten();
    setLoadingUsers(false);
    if (result.success && result.users) {
      setUsers(result.users);
    }
  };

  const fetchMenusForAccess = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/get_menus_admin.php`);
      const result = await res.json();

      const dynamicAkses: any[] = [{ id: "admin_super", label: "Admin Super" }];

      if (result.status === 'success' && result.data && Array.isArray(result.data)) {
        result.data.forEach((menu: any) => {
          const menuLabelClean = (menu.label || "").trim();
          const menuId = menu.id ? String(menu.id) : menuLabelClean.toLowerCase().replace(/\s+/g, '-');

          if (menuId) {
            if (!dynamicAkses.some(item => item.id === menuId)) {
              dynamicAkses.push({ id: menuId, label: menuLabelClean });
            }
          }
        });
      }

      if (dynamicAkses.length === 1) {
        setListHakAkses([
          { id: "admin_super", label: "Admin Super" },
          { id: "beranda", label: "Beranda" },
          { id: "tentang", label: "Tentang" },
          { id: "dokumen", label: "Dokumen" },
          { id: "evaluasi", label: "Evaluasi" },
          { id: "spme", label: "SPME" },
          { id: "berita", label: "Berita" },
        ]);
      } else {
        setListHakAkses(dynamicAkses);
      }

    } catch (err) {
      console.error("Gagal memuat daftar menu untuk hak akses:", err);
      setListHakAkses([
        { id: "admin_super", label: "Admin Super" },
        { id: "beranda", label: "Beranda" },
        { id: "tentang", label: "Tentang" },
        { id: "dokumen", label: "Dokumen" },
        { id: "evaluasi", label: "Evaluasi" },
        { id: "spme", label: "SPME" },
        { id: "berita", label: "Berita" },
      ]);
    }
  };

  const handleCheckboxChange = (aksesId: string) => {
    const item = listHakAkses.find(i => i.id === aksesId);
    const itemSlug = item ? item.label.toLowerCase().trim().replace(/\s+/g, '-') : '';

    const currentAksesArray = userForm.hak_akses ? userForm.hak_akses.split(",").map(s => s.trim()).filter(Boolean) : [];
    const hasAccess = currentAksesArray.includes(aksesId) || (itemSlug && currentAksesArray.includes(itemSlug));

    let updatedArray;
    if (hasAccess) {
      updatedArray = currentAksesArray.filter((itemVal) => itemVal !== aksesId && itemVal !== itemSlug);
    } else {
      updatedArray = [...currentAksesArray, aksesId];
    }

    setUserForm({ ...userForm, hak_akses: updatedArray.join(",") });
  };

  const handleAddUser = async () => {
    if (!userForm.nama || !userForm.email || !userForm.password) {
      toast.error("Nama, Email, dan Password wajib diisi.");
      return;
    }
    if (!userForm.email.includes("@")) {
      toast.error("Email harus mengandung '@'.");
      return;
    }

    const username = userForm.email.split("@")[0];

    setIsAddingUser(true);
    try {
      const result = await addAdminKonten({
        username: username,
        password: userForm.password,
        nama: userForm.nama,
        email: userForm.email,
        hak_akses: userForm.hak_akses,
      });

      if (result.success) {
        setUserForm({ nama: "", email: "", password: "", hak_akses: "" });
        setUserDialogOpen(false);
        toast.success("Admin konten baru berhasil ditambahkan.");
        fetchUsers();
      } else {
        toast.error(result.error || "Gagal menambahkan admin konten.");
        setErrorMessage(result.error || "Gagal menambahkan admin konten.");
        setErrorDialogOpen(true);
      }
    } catch (error) {
      toast.error("Terjadi kesalahan saat menambahkan admin konten.");
      console.error(error);
    } finally {
      setIsAddingUser(false);
    }
  };

  const openEditUser = (user: any) => {
    const currentUserId = currentUser?.id || currentUser?.userId;
    const isSuperAdminCheck = currentUser?.hak_akses?.includes('admin_super');
    const isMySelf = String(user.id) === String(currentUserId);

    if (!isSuperAdminCheck && !isMySelf) {
      toast.error("Anda tidak memiliki izin untuk mengedit akun orang lain.");
      return;
    }

    setSelectedUser(user);
    setUserForm({
      nama: user.nama || "",
      email: user.email || "",
      password: "",
      hak_akses: user.hak_akses ? user.hak_akses : "",
    });
    setEditUserDialogOpen(true);
  };

  const handleEditUser = async () => {
    if (!selectedUser) return;

    if (!userForm.nama || !userForm.email) {
      toast.error("Nama dan Email wajib diisi.");
      return;
    }
    if (!userForm.email.includes("@")) {
      toast.error("Email harus mengandung '@'.");
      return;
    }

    const updateData: any = {
      id: selectedUser.id,
      nama: userForm.nama,
      email: userForm.email,
      hak_akses: userForm.hak_akses !== undefined ? userForm.hak_akses : "",
      session_hak_akses: currentUser?.hak_akses || "",
    };
    if (userForm.password) {
      updateData.password = userForm.password;
    }

    const result = await updateAdminKonten(updateData);

    if (result.success) {
      const currentId = currentUser?.id || currentUser?.userId;

      if (currentUser && String(selectedUser.id) === String(currentId)) {
        const updatedUser = {
          ...currentUser,
          nama: userForm.nama,
          email: userForm.email,
          hak_akses: userForm.hak_akses,
        };

        sessionStorage.setItem("spmi_session", JSON.stringify(updatedUser));
        sessionStorage.setItem("spmi_user", JSON.stringify({
          ...updatedUser,
          id: currentId,
          role: userForm.hak_akses.includes('admin_super') ? 'admin_super' : 'admin_konten',
        }));

        setCurrentUser(updatedUser);
      }

      setSelectedUser(null);
      setUserForm({ nama: "", email: "", password: "", hak_akses: "" });
      setEditUserDialogOpen(false);
      toast.success("Data admin konten berhasil diperbarui.");
      fetchUsers();
    } else {
      toast.error(result.error || "Gagal memperbarui data.");
    }
  };

  const handleDeleteUser = (user: any, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!currentUser || user.email === currentUser.email) {
      toast.error("Tidak dapat menghapus akun sendiri.");
      return;
    }
    setUserToDelete(user);
    setDeleteDialogOpen(true);
  };

  const confirmDeleteUser = async () => {
    if (!userToDelete) return;
    const result = await deleteAdminKonten(userToDelete.id);
    if (result.success) {
      setUserToDelete(null);
      setDeleteDialogOpen(false);
      toast.success("Admin konten berhasil dihapus.");
      fetchUsers();
    } else {
      toast.error(result.error || "Gagal menghapus admin konten.");
    }
  };

  const renderHakAksesLabels = (hakAksesString: string) => {
    if (!hakAksesString) return "";

    const labels = hakAksesString.split(",")
      .map(s => s.trim())
      .filter(Boolean)
      .map(val => {
        // Cek apakah item ada di listHakAkses
        const found = listHakAkses.find(i =>
          i.id === val ||
          i.label.toLowerCase().trim().replace(/\s+/g, '-') === val.toLowerCase().trim().replace(/\s+/g, '-')
        );
        // Jika ditemukan, tampilkan labelnya. Jika tidak (sudah dihapus), kembalikan null agar bisa difilter.
        return found ? found.label : null;
      })
      .filter(Boolean); // Hapus nilai null (menu yang sudah terhapus)

    return labels.length > 0 ? labels.join(", ") : "Tidak ada hak akses";
  };

  return (
    <>
      <PageHeader title="Pengaturan" description="Kelola administrator dan hak akses konten portal web." />

      <div className="mt-5">
        <Card className="animate-fade-up rounded-2xl border-border/70 shadow-soft">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-base font-semibold">Administrator Konten</CardTitle>
                <CardDescription>Daftar administrator yang dapat mengelola artikel, berita, dan halaman web.</CardDescription>
              </div>
              {currentUser?.hak_akses?.includes('admin_super') && (
                <Button variant="gold" size="sm" onClick={() => setUserDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" /> Tambah Admin Konten
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent className="p-0 sm:p-6">
            <div className="w-full overflow-x-auto">
              {!currentUser?.hak_akses || currentUser?.hak_akses === "" ? (
                <div className="p-6 text-center border-2 border-dashed rounded-xl">
                  <ShieldCheck className="h-10 w-10 mx-auto text-muted-foreground mb-2" />
                  <h3 className="font-semibold">Menunggu Persetujuan</h3>
                  <p className="text-sm text-muted-foreground">
                    Akun Anda telah terdaftar. Silakan hubungi Admin Super untuk mendapatkan akses ke menu konten.
                  </p>
                </div>
              ) : (
                <Table className="w-full min-w-[600px]">
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[20%]">Nama</TableHead>
                      <TableHead className="w-[25%]">Email</TableHead>
                      <TableHead className="w-[25%]">Hak Akses</TableHead>
                      <TableHead className="w-[15%]">Status</TableHead>
                      <TableHead className="w-[15%]">Aksi</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loadingUsers ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-6 text-muted-foreground">
                          Memuat data...
                        </TableCell>
                      </TableRow>
                    ) : users.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-6 text-muted-foreground">
                          Tidak ada admin konten ditemukan.
                        </TableCell>
                      </TableRow>
                    ) : (
                      users.map((u) => (
                        <TableRow
                          key={u.id}
                          className={
                            currentUser?.hak_akses?.includes('admin_super') || u.id === currentUser?.userId
                              ? "cursor-pointer hover:bg-muted/50"
                              : "cursor-default"
                          }
                          onClick={() => {
                            const currentUserId = currentUser?.id || currentUser?.userId;
                            if (currentUser?.hak_akses?.includes('admin_super') || u.id === currentUserId) {
                              openEditUser(u);
                            } else {
                              toast.error("Anda tidak memiliki izin untuk mengedit akun orang lain.");
                            }
                          }}
                        >
                          <TableCell className="font-medium text-foreground">{u.nama}</TableCell>
                          <TableCell className="text-muted-foreground">{u.email}</TableCell>
                          <TableCell>
                            <span className="inline-flex items-center gap-1.5 text-sm text-gold font-medium">
                              <ShieldCheck className="h-4 w-4 flex-shrink-0" />
                              <span className="truncate max-w-[200px]" title={u.hak_akses}>
                                {u.hak_akses ? renderHakAksesLabels(u.hak_akses) : ""}
                              </span>
                            </span>
                          </TableCell>
                          <TableCell>
                            <StatusBadge status="Aktif" />
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-3">
                              {currentUser?.hak_akses?.includes('admin_super') && u.email !== currentUser?.email && (
                                <Trash2
                                  className="h-4 w-4 text-destructive cursor-pointer hover:text-destructive/80"
                                  onClick={(e) => handleDeleteUser(u, e)}
                                />
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Add User Dialog */}
        <Dialog open={userDialogOpen} onOpenChange={setUserDialogOpen}>
          <DialogContent className="w-[95vw] rounded-2xl sm:max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Tambah Admin Konten</DialogTitle>
              <DialogDescription className="text-sm">
                Tambahkan akun administrator baru dan tentukan hak akses menunya.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={(e) => { e.preventDefault(); handleAddUser(); }}>
              <div className="grid gap-3 py-2">
                <div className="grid gap-1.5">
                  <Label className="text-xs font-semibold text-muted-foreground">Nama Lengkap</Label>
                  <Input
                    value={userForm.nama}
                    onChange={(e) => setUserForm({ ...userForm, nama: e.target.value })}
                    className="rounded-xl h-10"
                    required
                  />
                </div>
                <div className="grid gap-1.5">
                  <Label className="text-xs font-semibold text-muted-foreground">Email *</Label>
                  <Input
                    type="email"
                    value={userForm.email}
                    onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                    placeholder="Contoh: adminkonten2@gmail.com"
                    className="rounded-xl h-10"
                    required
                  />
                </div>
                <div className="grid gap-1.5">
                  <Label className="text-xs font-semibold text-muted-foreground">Password *</Label>
                  <Input
                    type="password"
                    value={userForm.password}
                    onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
                    placeholder="Masukkan password"
                    className="rounded-xl h-10"
                    required
                  />
                </div>

                {/* Kotak Pilihan Hak Akses dengan Badge & Scroll */}
                <div className="grid gap-1.5">
                  <Label className="text-xs font-semibold text-muted-foreground">Hak Akses Menu</Label>

                  <div className="flex flex-wrap gap-1 min-h-[36px] p-1.5 bg-muted/40 rounded-xl border border-input text-xs">
                    {userForm.hak_akses ? (
                      userForm.hak_akses.split(",").map(s => s.trim()).filter(Boolean).map((itemVal) => {
                        const found = listHakAkses.find(i =>
                          i.id === itemVal ||
                          i.label.toLowerCase().trim().replace(/\s+/g, '-') === itemVal.toLowerCase().trim().replace(/\s+/g, '-')
                        );
                        if (!found) return null;
                        return (
                          <span key={itemVal} className="bg-primary/10 text-primary px-2 py-0.5 rounded-md font-medium flex items-center gap-1">
                            {found.label}
                          </span>
                        );
                      }).filter(Boolean)
                    ) : (
                      <span className="text-muted-foreground px-2 py-1 italic">Belum ada hak akses dipilih</span>
                    )}
                  </div>

                  <div className="border border-input rounded-xl bg-background max-h-40 overflow-y-auto p-2 space-y-1 shadow-inner">
                    {listHakAkses.map((item) => {
                      const currentAksesArray = userForm.hak_akses ? userForm.hak_akses.split(",").map(s => s.trim()).filter(Boolean) : [];
                      const itemSlug = item.label.toLowerCase().trim().replace(/\s+/g, '-');
                      const isChecked = currentAksesArray.includes(item.id) || currentAksesArray.includes(itemSlug);

                      return (
                        <div
                          key={item.id}
                          onClick={() => handleCheckboxChange(item.id)}
                          className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-accent cursor-pointer select-none transition-colors"
                        >
                          <span className="text-sm font-medium">{item.label}</span>
                          <div className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-colors ${isChecked ? 'bg-primary border-primary text-primary-foreground' : 'border-input bg-background'}`}>
                            {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              <DialogFooter className="flex flex-col-reverse sm:flex-row gap-2 mt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setUserDialogOpen(false)}
                  className="w-full sm:w-auto"
                >
                  Batal
                </Button>
                <Button type="submit" variant="gold" className="w-full sm:w-auto" disabled={isAddingUser}>
                  {isAddingUser ? "Menambahkan..." : "Tambah Akun"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Edit User Dialog */}
        <Dialog
          open={editUserDialogOpen}
          onOpenChange={(o) => !o && setEditUserDialogOpen(false)}
        >
          <DialogContent className="rounded-2xl sm:max-w-lg max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Edit Admin Konten</DialogTitle>
              <DialogDescription>
                Ubah data nama, email, password, atau perbarui hak akses menu.
              </DialogDescription>
            </DialogHeader>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleEditUser();
              }}
            >
              <div className="grid gap-3 py-2">
                <div className="grid gap-1.5">
                  <Label className="text-xs font-semibold text-muted-foreground">Nama Lengkap *</Label>
                  <Input
                    value={userForm.nama}
                    onChange={(e) => setUserForm({ ...userForm, nama: e.target.value })}
                    disabled={!isSuperAdmin && selectedUser?.id !== (currentUser?.id || currentUser?.userId)}
                    className="rounded-xl h-10"
                    required
                  />
                </div>
                <div className="grid gap-1.5">
                  <Label className="text-xs font-semibold text-muted-foreground">Email *</Label>
                  <Input
                    type="email"
                    value={userForm.email}
                    onChange={(e) => setUserForm({ ...userForm, email: e.target.value })}
                    placeholder="Contoh: adminkonten2@gmail.com"
                    className="rounded-xl h-10"
                    required
                  />
                </div>
                <div className="grid gap-1.5">
                  <Label className="text-xs font-semibold text-muted-foreground">
                    Password (Biarkan kosong jika tidak ingin mengubah)
                  </Label>
                  <Input
                    type="password"
                    value={userForm.password}
                    onChange={(e) => setUserForm({ ...userForm, password: e.target.value })}
                    placeholder="Masukkan password baru"
                    className="rounded-xl h-10"
                  />
                </div>

                {/* Kotak Pilihan Hak Akses dengan Badge & Scroll pada Edit */}
                <div className="grid gap-1.5">
                  <Label className="text-xs font-semibold text-muted-foreground">Hak Akses Menu</Label>

                  <div className="flex flex-wrap gap-1 min-h-[36px] p-1.5 bg-muted/40 rounded-xl border border-input text-xs">
                    {userForm.hak_akses ? (
                      userForm.hak_akses.split(",").map(s => s.trim()).filter(Boolean).map((itemVal) => {
                        const found = listHakAkses.find(i =>
                          i.id === itemVal ||
                          i.label.toLowerCase().trim().replace(/\s+/g, '-') === itemVal.toLowerCase().trim().replace(/\s+/g, '-')
                        );
                        if (!found) return null;
                        return (
                          <span key={itemVal} className="bg-primary/10 text-primary px-2 py-0.5 rounded-md font-medium flex items-center gap-1">
                            {found.label}
                          </span>
                        );
                      }).filter(Boolean)
                    ) : (
                      <span className="text-muted-foreground px-2 py-1 italic">Belum ada hak akses dipilih</span>
                    )}
                  </div>

                  <div className={`border border-input rounded-xl bg-background max-h-40 overflow-y-auto p-2 space-y-1 shadow-inner ${!isSuperAdmin ? 'opacity-50 pointer-events-none' : ''}`}>
                    {listHakAkses.map((item) => {
                      const currentAksesArray = userForm.hak_akses ? userForm.hak_akses.split(",").map(s => s.trim()).filter(Boolean) : [];
                      const itemSlug = item.label.toLowerCase().trim().replace(/\s+/g, '-');
                      const isChecked = currentAksesArray.includes(item.id) || currentAksesArray.includes(itemSlug);

                      return (
                        <div
                          key={item.id}
                          onClick={() => {
                            if (isSuperAdmin) {
                              handleCheckboxChange(item.id);
                            }
                          }}
                          className="flex items-center justify-between px-3 py-2 rounded-lg hover:bg-accent cursor-pointer select-none transition-colors"
                        >
                          <span className="text-sm font-medium">{item.label}</span>
                          <div className={`w-4 h-4 rounded border flex items-center justify-center shrink-0 transition-colors ${isChecked ? 'bg-primary border-primary text-primary-foreground' : 'border-input bg-background'}`}>
                            {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              <DialogFooter className="mt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setEditUserDialogOpen(false)}
                >
                  Batal
                </Button>
                <Button type="submit" variant="gold">
                  Simpan Perubahan
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Hapus Pengguna</AlertDialogTitle>
              <AlertDialogDescription>
                Apakah Anda yakin ingin menghapus akun admin konten "{userToDelete?.nama}"? Tindakan
                ini tidak dapat dibatalkan.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Batal</AlertDialogCancel>
              <AlertDialogAction
                onClick={confirmDeleteUser}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              >
                Hapus
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Error Dialog */}
        <AlertDialog open={errorDialogOpen} onOpenChange={setErrorDialogOpen}>
          <AlertDialogContent className="rounded-2xl">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-destructive flex items-center gap-2">
                <AlertCircle className="h-5 w-5" />
                Gagal Menambahkan Admin Konten
              </AlertDialogTitle>
              <AlertDialogDescription className="text-base">
                {errorMessage}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogAction onClick={() => setErrorDialogOpen(false)} className="rounded-xl">
                Mengerti
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </>
  );
}