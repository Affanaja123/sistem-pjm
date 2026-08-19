import { useState } from "react";
import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { Mail, Lock, Eye, EyeOff, ShieldCheck, ArrowRight, AlertCircle, User as UserIcon } from "lucide-react";
import campusBg from "@/assets/ipti.jpg";
import logo from "@/assets/logo ipti.png";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { login } from "@/lib/auth";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";

const API_BASE_URL = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api').replace(/\/api$/, '');

export const Route = createFileRoute("/index1")({
  head: () => ({
    meta: [
      { title: "Masuk — PJM Audit Management System" },
      {
        name: "description",
        content:
          "Masuk ke Pusat Jaminan Mutu untuk mengelola audit mutu internal perguruan tinggi.",
      },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [mode, setMode] = useState<"login" | "register">("login");
  const [regForm, setRegForm] = useState({

    nama: "",
    email: "",
    password: "",
  });

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const generatedUsername = regForm.email.split("@")[0].toLowerCase().replace(/[^a-z0-9]/g, '');

      const payload = {
        username: generatedUsername,
        nama: regForm.nama,
        email: regForm.email,
        password: regForm.password,
        hak_akses: "" 
      };

      // Arahkan langsung ke endpoint /api/register sesuai backend controller Anda
      const targetUrl = `${API_BASE_URL}/api/register`;
      console.log("Mencoba kirim ke URL:", targetUrl);

      const response = await fetch(targetUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const textResponse = await response.text();
      console.log("Raw response dari server:", textResponse);

      let data;
      try {
        data = JSON.parse(textResponse);
      } catch (parseErr) {
        throw new Error("Server mengembalikan bukan format JSON: " + textResponse);
      }

      if (response.ok && (data.success || data.status === 'success')) {
        toast.success("Pendaftaran berhasil! Silakan masuk.");
        setMode("login");
        setRegForm({ nama: "", email: "", password: "" });
      } else {
        setError(data.error || data.message || "Pendaftaran gagal.");
      }
    } catch (err: any) {
      console.error("Detail error register:", err);
      setError(err.message || "Gagal terhubung ke server.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    const result = await login(email, password);

    if (result.success && result.user) {
      // Cek hak akses: Jika user biasa, arahkan ke pengaturan, jika bukan ke beranda
      const userRole = result.user.hak_akses || result.user.role;
      if (userRole === "user_biasa" || userRole === "user") {
        navigate({ to: "/admin-konten/pengaturan" as any });
      } else {
        navigate({ to: "/admin-konten/beranda" as any });
      }
    } else {
      setError(result.error || "Login gagal");
      setIsLoading(false);
    }
  };

  return (
    <div className="grid min-h-screen lg:grid-cols-2">
      {/* Brand / campus side */}
      <div className="relative hidden overflow-hidden lg:block">
        <img
          src={campusBg}
          alt="Gedung kampus universitas"
          width={1920}
          height={1280}
          className="absolute inset-0 h-full w-full scale-105 object-cover"
        />
        <div className="absolute inset-0 bg-primary/80" />
        <div className="absolute inset-0 bg-gradient-to-t from-primary via-primary/40 to-transparent" />
        <div className="relative flex h-full flex-col justify-between p-12 text-white">
          <div className="flex items-center gap-3">
            <img
              src={logo}
              alt="Logo PJM"
              width={48}
              height={48}
              className="h-12 w-12 rounded-xl bg-white/95 p-1.5"
            />
            <div>
              <p className="font-display text-lg font-bold">PJM</p>
              <p className="text-xs text-white/70">Audit Management System</p>
            </div>
          </div>

          <div className="max-w-md animate-fade-up">
            <span className="inline-flex items-center gap-2 rounded-full border border-gold/40 bg-gold/15 px-3 py-1 text-xs font-medium text-gold">
              <ShieldCheck className="h-3.5 w-3.5" /> Pusat Jaminan Mutu
            </span>
            <h2 className="mt-5 font-display text-4xl font-bold leading-tight">
              Audit Mutu Internal yang{" "}
              <span className="text-gradient-gold">Terpercaya & Berkelas</span>
            </h2>
            <p className="mt-4 text-sm leading-relaxed text-white/75">
              Kelola siklus audit mutu internal perguruan tinggi secara modern — mulai dari
              penjadwalan, auditor, temuan, hingga laporan kepatuhan dalam satu platform
              terintegrasi.
            </p>
          </div>
        </div>
      </div>

      {/* Form side */}
      <div className="flex items-center justify-center bg-background px-6 py-12">
        <div className="w-full max-w-md animate-fade-up">
          <div className="mb-8 flex items-center gap-3 lg:hidden">
            <img
              src={logo}
              alt="Logo PJM"
              width={44}
              height={44}
              className="h-11 w-11 rounded-xl bg-card p-1 shadow-soft"
            />
            <div>
              <p className="font-display text-base font-bold text-foreground">PJM</p>
              <p className="text-xs text-muted-foreground">Audit Management System</p>
            </div>
          </div>

          {mode === "login" ? (
            <>
              <h1 className="font-display text-3xl font-bold text-foreground">Selamat Datang</h1>
              <p className="mt-2 text-sm text-muted-foreground">
                Masuk untuk mengakses dashboard audit mutu internal.
              </p>

              <form onSubmit={handleSubmit} className="mt-8 space-y-5">
                {error && (
                  <div className="flex items-center gap-2 rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
                    <AlertCircle className="h-4 w-4" />
                    {error}
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="Masukkan email"
                      className="h-11 rounded-xl pl-9"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      disabled={isLoading}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Masukkan password"
                      className="h-11 rounded-xl px-9"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}
                      disabled={isLoading}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <label className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Checkbox id="remember" defaultChecked /> Ingat saya
                  </label>
                  <a
                    href="mailto:admin@ipti.ac.id?subject=Lupa%20Password%20PJM&body=Halo%20admin%2C%20saya%20lupa%20password%20akun%20PJM%20saya.%20Mohon%20bantuan%20untuk%20reset%20password.%0A%0AEmail%20akun%3A%20"
                    className="text-sm font-medium text-gold hover:underline"
                  >
                    Lupa password?
                  </a>
                </div>

                <Button type="submit" variant="gold" size="lg" className="w-full" disabled={isLoading}>
                  {isLoading ? "Memproses..." : "Masuk"}{" "}
                  {!isLoading && <ArrowRight className="h-4 w-4" />}
                </Button>
              </form>

              <p className="mt-6 text-center text-xs text-muted-foreground">
                Butuh akses?{" "}
                <button
                  type="button"
                  onClick={() => { setMode("register"); setError(""); }}
                  className="font-medium text-gold hover:underline bg-transparent border-none cursor-pointer p-0"
                >
                  Daftar
                </button>
              </p>
            </>
          ) : (
            <>
              <h1 className="font-display text-3xl font-bold text-foreground">Daftar Akun</h1>
              <p className="mt-2 text-sm text-muted-foreground">
                Lengkapi formulir di bawah untuk membuat akun baru.
              </p>

              <form onSubmit={handleRegisterSubmit} className="mt-8 space-y-4">
                {error && (
                  <div className="flex items-center gap-2 rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
                    <AlertCircle className="h-4 w-4" />
                    {error}
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="reg-nama">Nama Lengkap</Label>
                  <div className="relative">
                    <UserIcon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="reg-nama"
                      type="text"
                      placeholder="Masukkan nama lengkap"
                      className="h-11 rounded-xl pl-9"
                      value={regForm.nama}
                      onChange={(e) => setRegForm({ ...regForm, nama: e.target.value })}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="reg-email">Email</Label>
                  <div className="relative">
                    <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="reg-email"
                      type="email"
                      placeholder="Masukkan email"
                      className="h-11 rounded-xl pl-9"
                      value={regForm.email}
                      onChange={(e) => setRegForm({ ...regForm, email: e.target.value })}
                      required
                    />
                  </div>
                </div>



                <div className="space-y-2">
                  <Label htmlFor="reg-password">Password</Label>
                  <div className="relative">
                    <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                    <Input
                      id="reg-password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Masukkan password"
                      className="h-11 rounded-xl px-9"
                      value={regForm.password}
                      onChange={(e) => setRegForm({ ...regForm, password: e.target.value })}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((v) => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>



                <Button type="submit" variant="gold" size="lg" className="w-full mt-2">
                  Daftar Akun <ArrowRight className="h-4 w-4 ml-1" />
                </Button>
              </form>

              <p className="mt-6 text-center text-xs text-muted-foreground">
                Sudah memiliki akun?{" "}
                <button
                  type="button"
                  onClick={() => { setMode("login"); setError(""); }}
                  className="font-medium text-gold hover:underline bg-transparent border-none cursor-pointer p-0"
                >
                  Masuk
                </button>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
