"use client";

import {
  Plus,
  User,
  LogOut,
  Search,
  Moon,
  Sun,
  SunMoon,
} from "lucide-react";

import { useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useUser } from "@/context/userContext";

type ThemeMode = "system" | "light" | "dark";

export default function Navbar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, logout } = useUser();

  const [search, setSearch] = useState("");
  const [openMenu, setOpenMenu] = useState(false);

  const [theme, setTheme] = useState<ThemeMode>("system");
  const [mounted, setMounted] = useState(false);

  const menuRef = useRef<HTMLDivElement>(null);

  // -------------------------
  // THEME ENGINE
  // -------------------------
  function applyTheme(mode: ThemeMode, systemDark: boolean) {
    const isDark =
      mode === "dark"
        ? true
        : mode === "light"
        ? false
        : systemDark;

    document.documentElement.classList.toggle("dark", isDark);
  }

  useEffect(() => {
    const saved = localStorage.getItem("theme") as ThemeMode | null;

    const systemDark = window.matchMedia(
      "(prefers-color-scheme: dark)"
    ).matches;

    const mode = saved ?? "system";

    setTheme(mode);
    applyTheme(mode, systemDark);
    setMounted(true);
  }, []);

  function cycleTheme() {
    const systemDark = window.matchMedia(
      "(prefers-color-scheme: dark)"
    ).matches;

    const next: ThemeMode =
      theme === "system"
        ? "light"
        : theme === "light"
        ? "dark"
        : "system";

    setTheme(next);
    localStorage.setItem("theme", next);
    applyTheme(next, systemDark);
  }

  // -------------------------
  // SEARCH
  // -------------------------
  useEffect(() => {
    const q = searchParams.get("q");
    if (q) setSearch(q);
  }, [searchParams]);

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!search.trim()) return;
    router.push(`/search?q=${encodeURIComponent(search)}`);
  }

  function handleLogout() {
    logout();
    router.push("/login");
    router.refresh();
  }

  // close dropdown
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpenMenu(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () =>
      document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!mounted) return <nav className="h-14 border-b" />;

  const isMobile = typeof window !== "undefined" && window.innerWidth < 768;

  return (
    <nav
      className="sticky top-0 z-50 flex items-center gap-4 px-6 py-3 border-b
      bg-white/70 dark:bg-zinc-900/60 backdrop-blur-md
      border-zinc-200 dark:border-zinc-800 text-black dark:text-white"
    >
      {/* LOGO */}
      <a href="/" className="font-bold text-2xl text-purple-700 dark:text-purple-400">
        <img src="/icon.png" className="w-10 inline-block rounded-full" alt="Goresan Logo" />
      </a>

      {/* SEARCH */}
      <form onSubmit={handleSearch} className="flex-1">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Cari karya..."
          className="w-full border rounded-full px-4 py-2 text-sm
          bg-transparent border-purple-700 dark:border-purple-400"
        />
      </form>

      {/* DESKTOP ACTIONS */}
      <div className="hidden md:flex items-center gap-2">
        {/* THEME BUTTON (desktop stays here) */}
        <button
          onClick={cycleTheme}
          className="p-2 rounded-full border border-zinc-300 dark:border-zinc-700"
        >
          {theme === "dark" ? (
            <Moon size={16} />
          ) : theme === "light" ? (
            <Sun size={16} />
          ) : (
            <SunMoon size={16} />
          )}
        </button>

        {/* UPLOAD (desktop stays visible) */}
        <a
          href="/upload"
          className="p-2 rounded-full border border-zinc-300 dark:border-zinc-700"
        >
          <Plus size={18} />
        </a>
      </div>

      {/* PROFILE */}
      {user && (
        <div className="relative" ref={menuRef}>
          <button onClick={() => setOpenMenu(!openMenu)}>
            <img
              src={user.profilePicture || "/default-avatar.png"}
              className="w-9 h-9 rounded-full border object-cover"
            />
          </button>

          {openMenu && (
            <div className="absolute right-0 top-12 w-52 bg-white/80 dark:bg-zinc-900/80 border border-purple-700 dark:border-purple-400 rounded-xl shadow-lg overflow-hidden">

              {/* USER INFO */}
              <div className="px-4 py-3 border-b border-zinc-200 dark:border-purple-400">
                <p className="font-bold">{user.username}</p>
                <p className="text-xs text-gray-500 dark:text-gray-300">{user.email}</p>
              </div>

              {/* MOBILE ONLY ACTIONS */}
              <div className="md:hidden">

                <button
                  onClick={cycleTheme}
                  className="w-full flex items-center gap-2 px-4 py-3 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                >
                  {theme === "dark" ? (
                    <Moon size={16} />
                  ) : theme === "light" ? (
                    <Sun size={16} />
                  ) : (
                    <SunMoon size={16} />
                  )}
                  Theme
                </button>

                <a
                  href="/upload"
                  className="flex items-center gap-2 px-4 py-3 hover:bg-zinc-100 dark:hover:bg-zinc-800"
                >
                  <Plus size={16} />
                  Upload
                </a>
              </div>

              {/* ALWAYS VISIBLE */}
              <a
                href={`/profile/${user._id}`}
                className="flex items-center gap-2 px-4 py-3 hover:bg-zinc-100 dark:hover:bg-zinc-800"
              >
                <User size={16} />
                Profile
              </a>

              <button
                onClick={handleLogout}
                className="w-full text-left flex items-center gap-2 px-4 py-3 hover:bg-red-100 dark:hover:bg-red-800"
              >
                <LogOut size={16} />
                Logout
              </button>
            </div>
          )}
        </div>
      )}
    </nav>
  );
}