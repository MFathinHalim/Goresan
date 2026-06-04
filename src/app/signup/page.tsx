"use client";

import React, { useState } from "react";
import Link from "next/link";
import axios from "axios";
import { toast, Toaster } from "react-hot-toast";
import { useRouter } from "next/navigation";

export default function SignUp() {
  const router = useRouter();

  const [user, setUser] = useState({ username: "", email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const isValid = user.username && user.email && user.password;

  async function onSignUp() {
    try {
      setLoading(true);
      await axios.post("/api/users/signup", user);
      setSent(true);
      toast.success("Cek email kamu untuk verifikasi");
      setTimeout(() => router.push("/verifyemail"), 1200);
    } catch {
      toast.error("Gagal daftar");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex bg-white dark:bg-zinc-950">
      <Toaster />

      {/* KIRI — gambar gede */}
      <div className="hidden md:block flex-1 relative overflow-hidden">
        <img
          src="https://images2.alphacoders.com/120/1209113.jpg"
          draggable={false}
          className="absolute inset-0 w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/10 via-transparent to-white dark:to-zinc-950" />
        <div className="absolute bottom-10 left-8 z-10">
          <p className="text-2xl font-bold text-white drop-shadow leading-snug">
            Mulai perjalanan<br />kreatifmu hari ini.
          </p>
          <p className="text-sm text-white/60 mt-1 drop-shadow">Platform galeri ilustrasi Indonesia</p>
        </div>
      </div>

      {/* KANAN — form */}
      <div className="flex flex-col justify-center items-center w-full md:w-[400px] shrink-0 px-8 py-16 relative">

        {/* accent blur */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-purple-400/20 dark:bg-purple-600/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 w-full max-w-sm">

          {/* logo */}
          <div className="mb-10">
            <h1 className="text-4xl font-bold text-purple-700 dark:text-purple-400">Goresan</h1>
            <p className="text-gray-400 text-sm mt-1">Buat akun baru</p>
          </div>

          <form
            onSubmit={e => { e.preventDefault(); if (isValid && !loading) onSignUp(); }}
            className="flex flex-col gap-5"
          >
            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-gray-400 uppercase tracking-widest">Username</label>
              <input
                value={user.username}
                onChange={e => setUser(p => ({ ...p, username: e.target.value }))}
                placeholder="username kamu"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-zinc-700 bg-white/60 dark:bg-zinc-900/60 backdrop-blur outline-none focus:border-purple-500 text-sm transition placeholder:text-gray-300"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-gray-400 uppercase tracking-widest">Email</label>
              <input
                type="email"
                value={user.email}
                onChange={e => setUser(p => ({ ...p, email: e.target.value }))}
                placeholder="email@kamu.com"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-zinc-700 bg-white/60 dark:bg-zinc-900/60 backdrop-blur outline-none focus:border-purple-500 text-sm transition placeholder:text-gray-300"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-xs text-gray-400 uppercase tracking-widest">Password</label>
              <input
                type="password"
                value={user.password}
                onChange={e => setUser(p => ({ ...p, password: e.target.value }))}
                placeholder="••••••••"
                className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-zinc-700 bg-white/60 dark:bg-zinc-900/60 backdrop-blur outline-none focus:border-purple-500 text-sm transition placeholder:text-gray-300"
              />
            </div>

            <button
              disabled={!isValid || loading || sent}
              className="mt-2 w-full py-3 bg-purple-700 dark:bg-purple-500 text-white text-sm rounded-xl hover:bg-purple-800 dark:hover:bg-purple-600 disabled:opacity-30 transition font-medium"
            >
              {loading ? "Membuat akun..." : sent ? "Email terkirim ✓" : "Buat akun"}
            </button>

            {sent && (
              <p className="text-center text-sm text-gray-400">
                Kami sudah kirim link verifikasi ke email kamu
              </p>
            )}
          </form>

          <p className="text-sm text-gray-400 mt-6 text-center">
            Sudah punya akun?{" "}
            <Link href="/login" className="text-purple-700 dark:text-purple-400 underline underline-offset-4">
              Masuk
            </Link>
          </p>
        </div>

        {/* mobile — gambar di atas */}
        <div className="flex md:hidden w-full mb-8 order-first rounded-2xl overflow-hidden h-48 relative">
          <img
            src="https://wallpaperaccess.com/full/1619146.jpg"
            draggable={false}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-white dark:to-zinc-950" />
        </div>
      </div>
    </div>
  );
}