const SESSION_KEY = "spmi_session";
const USER_KEY = "spmi_user";
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';



export interface AuthSession {
  userId: string;
  username: string;
  role: "admin_konten" | "admin_super";
  nama: string;
  email: string;
  loginTime: number;
}

export interface User {
  id: string;
  username: string;
  nama: string;
  role: "admin_konten" | "admin_super";
  email: string;
  hak_akses?: string;
}

export interface LoginResult {
  success: boolean;
  user?: User;
  error?: string;
}

export interface AddUserResult {
  success: boolean;
  user?: User;
  error?: string;
}

/**
 * Authenticate user with email and password via PHP API
 */
export async function login(email: string, password: string): Promise<LoginResult> {
  try {
    const response = await fetch(`${API_BASE_URL}/login.php`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    const text = await response.text();
    console.log("Login response:", text);

    const data = JSON.parse(text);

    if (!response.ok || !data.success) {
      return {
        success: false,
        error: data.error || "Login gagal",
      };
    }

    const user = data.user as User;
    // Tentukan role berdasarkan hak_akses dari server
    // Jika hak_akses berisi 'admin_super' → role admin_super
    // Selain itu → role admin_konten (apapun isi hak_akses-nya)
    const hakAkses = user.hak_akses || (user as any).role || "";
    const userRole: "admin_super" | "admin_konten" =
      typeof hakAkses === "string" && hakAkses.toLowerCase().includes("admin_super")
        ? "admin_super"
        : "admin_konten";
    user.role = userRole;
    const session: AuthSession = {
      userId: user.id,
      username: user.username,
      role: userRole,
      nama: user.nama,
      email: user.email,
      hak_akses: hakAkses,
      loginTime: Date.now(),
    } as any;

    // Store session in sessionStorage
    if (typeof sessionStorage !== "undefined") {
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
      sessionStorage.setItem(USER_KEY, JSON.stringify(user));
    }

    return {
      success: true,
      user,
    };
  } catch (error) {
    return {
      success: false,
      error: "Gagal terhubung ke server",
    };
  }
}

/**
 * Logout user and clear session
 */
export async function logout(): Promise<void> {
  if (typeof sessionStorage !== "undefined") {
    sessionStorage.removeItem(SESSION_KEY);
    sessionStorage.removeItem(USER_KEY);
  }
}

/**
 * Get current session from sessionStorage
 */
export function getSession(): AuthSession | null {
  if (typeof sessionStorage === "undefined") return null;
  const sessionData = sessionStorage.getItem(SESSION_KEY);
  if (!sessionData) return null;

  try {
    return JSON.parse(sessionData) as AuthSession;
  } catch {
    return null;
  }
}

/**
 * Get current user from sessionStorage
 */
export function getCurrentUser(): User | null {
  if (typeof sessionStorage === "undefined") return null;
  const userData = sessionStorage.getItem(USER_KEY);
  if (!userData) return null;

  try {
    const user = JSON.parse(userData);
    return user; // Pastikan objek user ini memang berisi 'hak_akses'
  } catch {
    return null;
  }
}

/**
 * Check if user is authenticated
 */
export function isAuthenticated(): boolean {
  return getSession() !== null;
}

/**
 * Check if user has specific role
 */
export function hasRole(role: "admin_konten" | "admin_super"): boolean {
  const session = getSession();
  return session?.role === role;
}

/**
 * Check if user is admin konten
 */
export function isAdminKonten(): boolean {
  return hasRole("admin_konten");
}

/**
 * Check if user is admin super
 */
export function isAdminSuper(): boolean {
  return hasRole("admin_super");
}

/**
 * Get all Admin Konten via PHP API
 */
export async function getAdminKonten(): Promise<{ success: boolean; users?: User[]; error?: string }> {
  try {
    const response = await fetch(`${API_BASE_URL}/get_admin_konten.php`);
    const data = await response.json();

    if (!response.ok || !data.success) {
      return {
        success: false,
        error: data.error || "Gagal mengambil data admin konten",
      };
    }

    const users = (data.users || []).map((u: any) => ({
      ...u,
      role: "admin_konten" as const,
    }));

    return {
      success: true,
      users,
    };
  } catch (error) {
    return {
      success: false,
      error: "Gagal terhubung ke server",
    };
  }
}

/**
 * Add new Admin Konten via PHP API
 */
export async function addAdminKonten(userData: {
  username: string;
  password: string;
  nama: string;
  email: string;
  hak_akses?: string;
}): Promise<AddUserResult> {
  try {
    const response = await fetch(`${API_BASE_URL}/add_admin_konten_user.php`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(userData),
    });

    const data = await response.json();

    if (!data.success) {
      return {
        success: false,
        error: data.error || "Gagal menambahkan admin konten",
      };
    }

    return {
      success: true,
      user: data.user,
    };
  } catch (error) {
    return {
      success: false,
      error: "Gagal terhubung ke server",
    };
  }
}

/**
 * Update Admin Konten via PHP API
 */
export async function updateAdminKonten(userData: any) {
  const currentUser = getCurrentUser(); // Mengambil data user yang sedang login

  try {
    const response = await fetch(`${API_BASE_URL}/update_admin_konten.php`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...userData,
        session_hak_akses: currentUser?.hak_akses // Kirim ini ke PHP
      }),
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      return {
        success: false,
        error: data.error || "Gagal mengupdate admin konten",
      };
    }

    return {
      success: true,
      user: data.user,
    };
  } catch (error) {
    return {
      success: false,
      error: "Gagal terhubung ke server",
    };
  }
}

/**
 * Delete Admin Konten via PHP API
 */
export async function deleteAdminKonten(userId: string): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetch(`${API_BASE_URL}/delete_admin_konten.php`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ id: userId }),
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      return {
        success: false,
        error: data.error || "Gagal menghapus admin konten",
      };
    }

    return {
      success: true,
    };
  } catch (error) {
    return {
      success: false,
      error: "Gagal terhubung ke server",
    };
  }
}

