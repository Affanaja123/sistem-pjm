import { useState, useEffect, useRef } from "react";
import { Link, useRouterState, Outlet, useNavigate } from "@tanstack/react-router";
import {
  ChevronDown, ChevronRight, Home, Info, FileText, BarChart3,
  ShieldCheck, Newspaper, Settings, Menu as MenuIcon, Menu, X, LogOut, ChevronDown as ChevronDownIcon
} from "lucide-react";
import logo from "@/assets/logo ipti.png";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel,
  DropdownMenuSeparator, DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { logout, getCurrentUser } from "@/lib/auth";

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api').replace(/\/api$/, '');

// Memastikan setiap route sub-menu selalu mengarah ke halaman admin, bukan publik
const normalizeAdminRoute = (route: string): string => {
  if (!route) return route;
  if (route.startsWith('/admin-konten/')) return route;
  return `/admin-konten${route.startsWith('/') ? '' : '/'}${route}`;
};

// Mapping string ikon dari database ke komponen Lucide React
const iconMap: Record<string, any> = {
  Home,
  Info,
  FileText,
  BarChart3,
  ShieldCheck,
  Newspaper,
};

// Filter menu sidebar berdasarkan hak akses user (mendukung menu baru secara akurat)
// Filter menu sidebar berdasarkan hak akses user secara akurat
// Filter menu sidebar berdasarkan hak akses user (aman & sub-menu tetap normal)
// Filter menu sidebar berdasarkan hak akses user (aman untuk tipe data angka/string & sub-menu normal)
const getFilteredNavItems = (menus: any[], hakAkses: string | undefined | null) => {
  if (hakAkses && hakAkses.toLowerCase().includes("admin_super")) return menus;

  const userAccessList = hakAkses ? hakAkses.toLowerCase().split(",").map(s => s.trim()).filter(Boolean) : [];
  if (userAccessList.length === 0) return [];

  // Fungsi helper: cek apakah satu item diizinkan berdasarkan daftar hak akses
  const isItemAllowed = (id: string, label: string, route: string) => {
    const idClean = String(id || "").trim();
    const labelClean = (label || "").trim().toLowerCase();
    const routeClean = (route || "").toLowerCase();
    return userAccessList.some(access => {
      const cleanAccess = access.trim();
      // Cocokkan berdasarkan ID (angka), label kata, atau segmen route
      // Hindari pencocokan parsial angka dalam string label/route
      const isNumeric = /^\d+$/.test(cleanAccess);
      if (isNumeric) {
        // Jika hak akses berupa angka, hanya cocokkan dengan ID
        return idClean === cleanAccess;
      }
      return (
        idClean === cleanAccess ||
        labelClean.includes(cleanAccess) ||
        routeClean.includes(cleanAccess)
      );
    });
  };

  const result: any[] = [];

  for (const item of menus) {
    const menuId = String(item.id || "").trim();
    const labelClean = (item.label || "").trim().toLowerCase();
    const itemRoute = (item.route || item.to || "").toLowerCase();

    // 1. Sembunyikan mutlak menu BERANDA jika user tidak punya hak aksesnya
    const isBeranda = labelClean.includes("beranda") || itemRoute.includes("beranda") || menuId === "1";
    if (isBeranda) {
      const hasBerandaAccess = userAccessList.some(access => access === "1" || access.includes("beranda"));
      if (!hasBerandaAccess) continue;
    }

    // 2. Cek apakah menu utama diizinkan
    const isMainAllowed = isItemAllowed(menuId, item.label, item.route || item.to || "");

    // 3. Jika memiliki sub-menu, saring dengan IMMUTABLE (tidak mutasi data asli)
    if (item.subItems && Array.isArray(item.subItems)) {
      const filteredSubItems = item.subItems.filter((sub: any) => {
        const subId = String(sub.id || "").trim();
        // Sub-menu diizinkan jika: sub itu sendiri diizinkan ATAU parent-nya diizinkan
        return isMainAllowed || isItemAllowed(subId, sub.label, sub.to || "");
      });

      // Tampilkan menu utama jika dia sendiri diizinkan ATAU memiliki sub-menu yang lolos filter
      if (isMainAllowed || filteredSubItems.length > 0) {
        // ✅ Buat objek BARU — tidak mutasi item asli dari state
        result.push({ ...item, subItems: filteredSubItems });
      }
      continue;
    }

    if (isMainAllowed) {
      result.push(item);
    }
  }

  return result;
};

// Validasi apakah pathname saat ini diizinkan untuk diakses oleh user
// Validasi apakah pathname saat ini diizinkan untuk diakses oleh user (DIAMANKAN)
const isPathnameAllowed = (pathname: string, hakAkses: string | undefined | null, menus: any[] = []) => {
  // Hanya halaman pengaturan dasar universal yang bebas diakses
  if (pathname === "/admin-konten" || pathname === "/admin-konten/pengaturan") {
    return true;
  }

  if (!hakAkses || hakAkses.trim() === "") return false;

  // Jika admin super, izinkan segalanya tanpa syarat
  const isSuper = hakAkses.toLowerCase().includes("admin_super");
  if (isSuper) return true;

  const cleanPath = pathname.toLowerCase();

  // Ambil daftar menu yang IZINKAN untuk user ini berdasarkan hak_akses mereka (misal: "2")
  const allowedMenus = getFilteredNavItems(menus, hakAkses);

  const isAllowed = allowedMenus.some(menu => {
    // Check main route
    const mainRoute = normalizeAdminRoute(menu.to || "").toLowerCase().trim();
    if (mainRoute && (cleanPath === mainRoute || cleanPath.startsWith(mainRoute + "/"))) return true;

    // Tambahan: Jika route utamanya /admin-konten/beranda (atau sejenisnya), 
    // izinkan juga sub-fitur detail layanan mutunya
    if (mainRoute.includes("beranda")) {
      const berandaSubPaths = [
        "/admin-konten/pelaporan",
        "/admin-konten/sistem-informasi",
        "/admin-konten/konsultasi-mutu"
      ];
      if (berandaSubPaths.some(p => cleanPath === p || cleanPath.startsWith(p + "/"))) {
        return true;
      }
    }

    // Check sub items
    if (menu.subItems && Array.isArray(menu.subItems)) {
      return menu.subItems.some((sub: any) => {
        const subRoute = normalizeAdminRoute(sub.to || "").toLowerCase().trim();
        return subRoute && (cleanPath === subRoute || cleanPath.startsWith(subRoute + "/"));
      });
    }
    return false;
  });

  if (isAllowed) return true;

  // Fallback pencocokan manual string hak_akses (untuk backward compatibility)
  const userAccessList = hakAkses.toLowerCase().split(",").map(s => s.trim());
  return userAccessList.some(access => {
    const cleanAccess = access.trim();
    if (!cleanAccess) return false;

    // Jika user punya hak akses "beranda" atau "1", izinkan juga detail layanan mutunya
    if (cleanAccess === "1" || cleanAccess === "beranda") {
      const berandaSubPaths = [
        "/admin-konten/pelaporan",
        "/admin-konten/sistem-informasi",
        "/admin-konten/konsultasi-mutu"
      ];
      if (berandaSubPaths.some(p => cleanPath === p || cleanPath.startsWith(p + "/"))) {
        return true;
      }
    }

    if (cleanPath.includes(cleanAccess)) return true;
    if (cleanPath.startsWith(`/admin-konten/${cleanAccess}`)) return true;

    return false;
  });
};

const handleLogout = async () => {
  await logout();
  window.location.href = "/";
};

export function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const [navItems, setNavItems] = useState<any[]>([]);
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  // Ref untuk mencegah auto-open menimpa pilihan user setelah data pertama kali dimuat
  const hasAutoOpened = useRef(false);

  const user: any = getCurrentUser();

  // Ambil menu dinamis dari backend get_menus_admin.php
  useEffect(() => {
    fetch(`${API_BASE_URL}/api/get_menus_admin.php`)
      .then(res => res.json())
      .then(res => {
        if (res.status === 'success' && res.data) {
          setNavItems(res.data);
        }
      })
      .catch(err => console.error("Gagal memuat menu sidebar:", err));
  }, []);

  const filteredItems = getFilteredNavItems(navItems, user?.hak_akses);

  // ✅ FIX UTAMA: Auto-open hanya SEKALI setelah data menu pertama kali tersedia.
  // Menggunakan ref agar tidak pernah reset saat user manual toggle.
  useEffect(() => {
    if (filteredItems.length === 0 || hasAutoOpened.current) return;
    hasAutoOpened.current = true;

    const activeItem = filteredItems.find(item =>
      item.subItems?.some((sub: any) =>
        pathname.startsWith(normalizeAdminRoute(sub.to))
      )
    );
    // Jika ada sub-menu aktif → buka, jika tidak → biarkan semua tertutup
    setOpenMenu(activeItem ? activeItem.label : null);
  }, [filteredItems]); // hanya bereaksi saat filteredItems berubah (saat data datang)

  // ✅ Toggle langsung & responsif — tidak pernah di-override oleh useEffect manapun
  const toggleMenu = (label: string) => {
    setOpenMenu(prev => (prev === label ? null : label));
  };

  return (
    <div className="flex h-full flex-col bg-sidebar text-sidebar-foreground">
      {/* Bagian Header Sidebar */}
      <div className="flex items-center gap-3 px-6 py-6">
        <img src={logo} alt="Logo" width={40} height={40} className="h-10 w-10 rounded-lg bg-white/95 p-1" />
        <div className="leading-tight">
          <p className="font-display text-base font-bold text-white">Admin Konten</p>
          <p className="text-[11px] text-sidebar-foreground/70">Home Page Manager</p>
        </div>
      </div>

      {/* Navigasi Utama di Tengah */}
      <nav className="flex-1 space-y-1 overflow-y-auto px-3 py-2">
        {filteredItems.map((item) => {
          const isParentActive = item.subItems?.some((sub: any) => pathname.startsWith(sub.to));
          const isOpen = openMenu === item.label;
          const IconComponent = iconMap[item.icon] || FileText;

          return (
            <div key={item.label}>
              {item.subItems ? (
                <>
                  <button
                    onClick={() => toggleMenu(item.label)}
                    className={cn(
                      "flex w-full items-center justify-between rounded-xl px-3 py-2.5 text-sm font-medium transition-all hover:bg-sidebar-accent hover:text-white",
                      isParentActive ? "bg-sidebar-primary/20 text-white" : "text-sidebar-foreground"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <IconComponent className="h-[18px] w-[18px]" />
                      {item.label}
                    </div>
                    {isOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />}
                  </button>
                  {/* ✅ Animasi accordion CSS — tidak glitch, responsif saat diklik */}
                  <div
                    style={{
                      maxHeight: isOpen ? `${item.subItems.length * 44}px` : "0px",
                      overflow: "hidden",
                      transition: "max-height 0.25s ease",
                    }}
                  >
                    <div className="ml-4 mt-1 space-y-1 border-l border-sidebar-border/50 pl-2 pb-1">
                      {item.subItems.map((sub: any) => {
                        const normalizedTo = normalizeAdminRoute(sub.to);
                        return (
                          <Link
                            key={sub.to}
                            to={normalizedTo as any}
                            onClick={onNavigate}
                            className={cn(
                              "block rounded-lg px-3 py-2 text-xs font-medium transition-all duration-150",
                              pathname === normalizedTo
                                ? "bg-sidebar-primary text-white shadow-sm"
                                : "text-sidebar-foreground/70 hover:bg-sidebar-accent/60 hover:text-white"
                            )}
                          >
                            {sub.label}
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                </>
              ) : (
                <Link
                  to={normalizeAdminRoute(item.to!) as any}
                  onClick={onNavigate}
                  className={cn(
                    "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all hover:bg-sidebar-accent hover:text-white",
                    pathname === normalizeAdminRoute(item.to!) ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-gold" : "text-sidebar-foreground"
                  )}
                >
                  <IconComponent className="h-[18px] w-[18px]" />
                  {item.label}
                </Link>
              )}
            </div>
          );
        })}
      </nav>

      {/* Bagian Bawah Sekali (Pojok Kiri Bawah) Khusus Kelola Menu & Pengaturan */}
      {/* Bagian Bawah Sekali (Pojok Kiri Bawah) Khusus Kelola Menu & Pengaturan */}
      <div className="p-3 border-t border-sidebar-border/55 space-y-1">
        {/* Tombol Kelola Menu (HANYA MUNCUL JIKA ADMIN SUPER) */}
        {user?.hak_akses?.toLowerCase().includes("admin_super") && (
          <Link
            to={"/admin-konten/kelola-menu" as any}
            onClick={onNavigate}
            className={cn(
              "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all hover:bg-sidebar-accent hover:text-white",
              pathname === "/admin-konten/kelola-menu" ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-gold" : "text-sidebar-foreground"
            )}
          >
            <MenuIcon className="h-[18px] w-[18px]" />
            Kelola Menu
          </Link>
        )}

        {/* Menu Pengaturan (Muncul untuk semua admin yang valid) */}
        <Link
          to={"/admin-konten/pengaturan" as any}
          onClick={onNavigate}
          className={cn(
            "flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all hover:bg-sidebar-accent hover:text-white",
            pathname === "/admin-konten/pengaturan" ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-gold" : "text-sidebar-foreground"
          )}
        >
          <Settings className="h-[18px] w-[18px]" />
          Pengaturan
        </Link>
      </div>
    </div>
  );
}

export function AdminKontenShell() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  // Sinkronisasi otomatis sesi user terbaru agar hak akses menu baru langsung terbaca
  useEffect(() => {
    const user: any = getCurrentUser();
    if (!user || (user.role !== "admin_konten" && user.role !== "admin_super")) {
      navigate({ to: "/index1", replace: true });
      return;
    }

    const checkAccess = (finalUser: any, menus: any[]) => {
      // Halaman root dan pengaturan universal
      if (pathname === "/admin-konten" || pathname === "/admin-konten/pengaturan") {
        setIsChecking(false);
        return;
      }

      // Jika path saat ini tidak diizinkan untuk hak_akses "2" milik Athar
      if (!isPathnameAllowed(pathname, finalUser?.hak_akses, menus)) {
        // Cari menu sah pertama milik user (berdasarkan hak_akses "2" / Tentang)
        const allowedMenus = getFilteredNavItems(menus, finalUser?.hak_akses);
        let fallbackRoute = "/admin-konten/pengaturan";

        if (allowedMenus.length > 0) {
          const firstMenu = allowedMenus[0];
          fallbackRoute = normalizeAdminRoute(
            firstMenu.to || (firstMenu.subItems && firstMenu.subItems[0]?.to) || "/admin-konten/pengaturan"
          );
        }

        // Alihkan Athar langsung ke halaman Tentang miliknya, bukan ke Beranda!
        navigate({ to: fallbackRoute as any, replace: true });
      } else {
        setIsChecking(false);
      }
    };

    // Ambil data menu dinamis & user terbaru secara paralel/berurutan
    fetch(`${API_BASE_URL}/api/get_menus_admin.php`)
      .then(res => res.json())
      .then(menuResult => {
        const menus = (menuResult.status === 'success' && menuResult.data) ? menuResult.data : [];

        const userId = user.id || user.userId;
        if (userId) {
          fetch(`${API_BASE_URL}/api/get_admin_konten.php`)
            .then(res => res.json())
            .then(result => {
              let finalUser = user;
              if (result.success && Array.isArray(result.users)) {
                const freshUser = result.users.find((u: any) => String(u.id) === String(userId));
                if (freshUser) {
                  const hakAkses = freshUser.hak_akses || "";
                  const role = hakAkses.toLowerCase().includes('admin_super') ? 'admin_super' : 'admin_konten';
                  finalUser = {
                    ...user,
                    hak_akses: hakAkses,
                    role
                  };
                  sessionStorage.setItem("spmi_session", JSON.stringify(finalUser));
                  sessionStorage.setItem("spmi_user", JSON.stringify(finalUser));
                }
              }
              checkAccess(finalUser, menus);
            })
            .catch(err => {
              console.error("Gagal sinkronisasi sesi latar belakang:", err);
              checkAccess(user, menus);
            });
        } else {
          checkAccess(user, menus);
        }
      })
      .catch(err => {
        console.error("Gagal mengambil menu untuk verifikasi akses:", err);
        // Fallback jika fetch menus gagal — tetap izinkan masuk
        setIsChecking(false);
      });
  }, [navigate, pathname]);

  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'spmi_session' || e.key === 'spmi_user') {
        window.location.reload();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  if (isChecking) return null;

  return (
    <div className="min-h-screen w-full bg-white">
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 border-r border-sidebar-border lg:block">
        <SidebarContent />
      </aside>

      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-foreground/40 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <div className="absolute inset-y-0 left-0 w-64 shadow-card">
            <button className="absolute right-3 top-4 z-10 grid h-8 w-8 place-items-center rounded-lg text-white/80 hover:bg-white/10" onClick={() => setMobileOpen(false)}>
              <X className="h-5 w-5" />
            </button>
            <SidebarContent onNavigate={() => setMobileOpen(false)} />
          </div>
        </div>
      )}

      <div className="lg:pl-64">
        <header className="sticky top-0 z-20 border-b border-border bg-card/80 backdrop-blur-md">
          <div className="flex h-16 items-center gap-3 px-4 sm:px-6">
            <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setMobileOpen(true)}>
              <Menu className="h-5 w-5" />
            </Button>
            <div className="ml-auto flex items-center gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-2 rounded-xl px-1.5 py-1 transition-colors hover:bg-accent">
                    <Avatar className="h-9 w-9">
                      <AvatarFallback className="bg-primary text-primary-foreground font-semibold text-sm">AK</AvatarFallback>
                    </Avatar>
                    <ChevronDownIcon className="hidden h-4 w-4 text-muted-foreground sm:block" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-52">
                  <DropdownMenuLabel>Akun Saya</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild><Link to={"/admin-konten/pengaturan" as any}><Settings className="mr-2 h-4 w-4" /> Pengaturan</Link></DropdownMenuItem>
                  <DropdownMenuItem onClick={handleLogout}><LogOut className="mr-2 h-4 w-4" /> Keluar</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </header>
        <main className="mx-auto max-w-7xl space-y-6 p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}