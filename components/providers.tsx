"use client";
import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import { CheckCircle2, X, AlertCircle } from "lucide-react";
import type { SafeUser } from "@/lib/types";
type AppState = {
  user: SafeUser | null;
  loading: boolean;
  saved: string[];
  toggleSave: (id: string, demo?: boolean) => Promise<void>;
  notify: (message: string, error?: boolean) => void;
  refreshUser: () => Promise<void>;
};
const Context = createContext<AppState>({
  user: null,
  loading: true,
  saved: [],
  toggleSave: async () => {},
  notify: () => {},
  refreshUser: async () => {},
});
export function useApp() {
  return useContext(Context);
}
export async function api<T = Record<string, unknown>>(
  path: string,
  body?: unknown,
  method = "POST",
): Promise<T> {
  const response = await fetch(`/api/${path}`, {
    method: body === undefined && method === "POST" ? "GET" : method,
    headers: body === undefined ? {} : { "Content-Type": "application/json" },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || "Please try again.");
  return data;
}
export function Providers({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<SafeUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState<string[]>([]);
  const [toast, setToast] = useState<{
    message: string;
    error?: boolean;
  } | null>(null);
  const notify = useCallback(
    (message: string, error = false) => setToast({ message, error }),
    [],
  );
  const applySession = useCallback(async (data: { user: SafeUser | null }) => {
    setUser(data.user);
    try {
      const stored = JSON.parse(localStorage.getItem("ceylon_saved") || "[]");
      setSaved(
        Array.isArray(stored)
          ? stored.filter((id): id is string => typeof id === "string")
          : [],
      );
    } catch {
      setSaved([]);
    }
    if (data.user) {
      try {
        const result = await api<{ favorites: { listingId: string }[] }>(
          "favorites",
        );
        setSaved((previous) => [
          ...new Set([
            ...previous.filter((id) => id.startsWith("demo-")),
            ...result.favorites.map((f) => f.listingId),
          ]),
        ]);
      } catch {
        /* retain device favorites if synchronization is temporarily unavailable */
      }
    }
    setLoading(false);
  }, []);
  const refreshUser = useCallback(async () => {
    try {
      await applySession(await api<{ user: SafeUser | null }>("auth/me"));
    } catch {
      setUser(null);
      setLoading(false);
    }
  }, [applySession]);
  useEffect(() => {
    api<{ user: SafeUser | null }>("auth/me")
      .then(applySession)
      .catch(() => {
        setUser(null);
        setLoading(false);
      });
  }, [applySession]);
  useEffect(() => {
    if (!toast) return;
    const timeout = setTimeout(() => setToast(null), 4500);
    return () => clearTimeout(timeout);
  }, [toast]);
  async function toggleSave(id: string, demo = false) {
    const next = !saved.includes(id);
    try {
      if (user && !demo) await api("favorites", { listingId: id, saved: next });
      const values = next ? [...saved, id] : saved.filter((s) => s !== id);
      setSaved(values);
      localStorage.setItem("ceylon_saved", JSON.stringify(values));
      notify(
        next
          ? user && !demo
            ? "Added to your saved places."
            : "Saved on this device. Find it in your dashboard."
          : "Removed from saved places.",
      );
    } catch (e) {
      notify((e as Error).message, true);
    }
  }
  return (
    <Context.Provider
      value={{ user, loading, saved, toggleSave, notify, refreshUser }}
    >
      {children}
      {toast && (
        <div
          className={`toast ${toast.error ? "toast-error" : ""}`}
          role={toast.error ? "alert" : "status"}
        >
          {toast.error ? <AlertCircle2Fallback /> : <CheckCircle2 size={20} />}
          <span>{toast.message}</span>
          <button
            aria-label="Dismiss notification"
            onClick={() => setToast(null)}
          >
            <X size={17} />
          </button>
        </div>
      )}
    </Context.Provider>
  );
}
function AlertCircle2Fallback() {
  return <AlertCircle size={20} />;
}
