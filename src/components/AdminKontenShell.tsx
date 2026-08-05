import { useState, useEffect } from "react";
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
const getFilteredNavItems = (menus: any[], hakAkses: string | undefined | null) => {
  if (hakAkses && hakAkses.toLowerCase().includes("admin_super")) return menus;

  const userAccessList = hakAkses ? hakAkses.toLowerCase().split(",").map(s => s.trim()).filter(Boolean) : [];

  return menus.filter((item) => {
    const labelClean = (item.label || "").trim().toLowerCase();
    const menuId = labelClean.replace(/\s+/g, '-');

    if (userAccessList.length === 0) return false;

    // Cek apakah ID menu (DB ID), slug, atau label menu ada di dalam daftar hak akses user
    return userAccessList.some(access => {
      const cleanAccess = access.trim();
      return (
        String(item.id) === cleanAccess ||
        menuId === cleanAccess ||
        labelClean.includes(cleanAccess) ||
        (item.route && item.route.toLowerCase().includes(cleanAccess))
      );
    });
  });
};

// Validasi apakah pathname saat ini diizinkan untuk diakses oleh user
const isPathnameAllowed = (pathname: string, hakAkses: string | undefined | null, menus: any[] = []) => {
  // Halaman umum admin selalu diizinkan untuk semua admin yang valid
  if (
    pathname === "/admin-konten" ||
    pathname === "/admin-konten/beranda" ||
    pathname === "/admin-konten/pengaturan" ||
    pathname === "/admin-konten/kelola-menu"
  ) {
    return true;
  }

  if (!hakAkses || hakAkses.trim() === "") return false;

  // Jika admin super, izinkan segalanya tanpa syarat
  const isSuper = hakAkses.toLowerCase().includes("admin_super");
  if (isSuper) return true;

  const cleanPath = pathname.toLowerCase();
  const userAccessList = hakAkses.toLowerCase().split(",").map(s => s.trim());

  // 1. Cek apakah ada menu dalam list menus yang jalurnya cocok dengan pathname saat ini dan diizinkan
  const allowedMenus = getFilteredNavItems(menus, hakAkses);
  const isAllowed = allowedMenus.some(menu => {
    // Check main route
    const mainRoute = (menu.to || "").toLowerCase().trim();
    if (mainRoute && (cleanPath === mainRoute || cleanPath.startsWith(mainRoute + "/"))) return true;

    // Check sub items
    if (menu.subItems && Array.isArray(menu.subItems)) {
      return menu.subItems.some((sub: any) => {
        const subRoute = (sub.to || "").toLowerCase().trim();
        return subRoute && (cleanPath === subRoute || cleanPath.startsWith(subRoute + "/"));
      });
    }
    return false;
  });

  if (isAllowed) return true;

  // 2. Fallback pencocokan manual menggunakan teks hak akses (untuk backward compatibility)
  return userAccessList.some(access => {
    const cleanAccess = access.trim();
    if (!cleanAccess) return false;

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

  const [openMenu, setOpenMenu] = useState<string | null>(() => {
    const activeItem = filteredItems.find(item =>
      item.subItems?.some((sub: any) => pathname.startsWith(sub.to))
    );
    return activeItem ? activeItem.label : null;
  });

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
                  {isOpen && (
                    <div className="ml-4 mt-1 space-y-1 border-l border-sidebar-border/50 pl-2">
                      {item.subItems.map((sub: any) => {
                        const normalizedTo = normalizeAdminRoute(sub.to);
                        return (
                          <Link
                            key={sub.to}
                            to={normalizedTo as any}
                            onClick={onNavigate}
                            className={cn(
                              "block rounded-lg px-3 py-2 text-xs font-medium transition-all",
                              pathname === normalizedTo ? "bg-sidebar-primary text-white" : "text-sidebar-foreground/70 hover:text-white"
                            )}
                          >
                            {sub.label}
                          </Link>
                        );
                      })}
                    </div>
                  )}
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
      // Beranda selalu boleh diakses oleh semua admin yang terautentikasi
      if (
        pathname === "/admin-konten" ||
        pathname === "/admin-konten/beranda" ||
        pathname === "/admin-konten/pengaturan"
      ) {
        setIsChecking(false);
        return;
      }

      if (!isPathnameAllowed(pathname, finalUser?.hak_akses, menus)) {
        navigate({ to: "/admin-konten/beranda", replace: true });
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