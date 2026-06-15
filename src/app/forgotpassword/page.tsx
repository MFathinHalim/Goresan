"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast, Toaster } from "react-hot-toast";
import Link from "next/link";
import { ArrowLeft, KeyRound, Mail, CheckCircle2 } from "lucide-react";

export default function ForgotPassword() {
    const [token, setToken] = useState<string | null>(null);

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");

    const [loading, setLoading] = useState(false);
    const [sent, setSent] = useState(false);
    const [resetSuccess, setResetSuccess] = useState(false);

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const t = params.get("token");

        if (t) {
            setToken(t);
        }
    }, []);

    const sendResetLink = async () => {
        try {
            setLoading(true);

            await axios.post("/api/users/forgotpassword", {
                email,
            });

            setSent(true);
            toast.success("Link reset password berhasil dikirim");
        } catch (e: any) {
            toast.error(e.response?.data?.message || "Gagal mengirim link reset password");
        } finally {
            setLoading(false);
        }
    };

    const resetPassword = async () => {
        if (!token) {
            toast.error("Token tidak ditemukan");
            return;
        }

        if (!password) {
            toast.error("Password wajib diisi");
            return;
        }

        if (password.length < 6) {
            toast.error("Password minimal 6 karakter");
            return;
        }

        if (password !== confirmPassword) {
            toast.error("Konfirmasi password tidak cocok");
            return;
        }

        try {
            setLoading(true);

            await axios.post("/api/users/resetpassword", {
                token,
                password,
            });

            setResetSuccess(true);
            toast.success("Password berhasil direset");

            setTimeout(() => {
                window.location.href = "/login";
            }, 1500);
        } catch (e: any) {
            toast.error(e.response?.data?.message || "Token tidak valid atau sudah kedaluwarsa");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className='min-h-[calc(100vh-66px)] bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 selection:bg-purple-500/30 flex flex-col'>
            <Toaster />

            {/* KONTEN UTAMA */}
            <main className='flex-1 flex items-center justify-center px-6 py-12 relative overflow-hidden'>
                {/* Dekorasi Latar Belakang Minimalis */}
                <div className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-purple-400/10 dark:bg-purple-600/10 rounded-full blur-3xl pointer-events-none' />

                <div className='w-full max-w-md bg-white dark:bg-zinc-900/40 border border-zinc-100 dark:border-zinc-900 p-8 rounded-2xl shadow-xl shadow-zinc-100/50 dark:shadow-none relative z-10 backdrop-blur-sm'>
                    {/* Bagian Icon Dinamis */}
                    <div className='mx-auto w-12 h-12 rounded-xl bg-purple-50 dark:bg-purple-950/50 flex items-center justify-center text-purple-700 dark:text-purple-400 mb-6'>
                        {token ?
                            resetSuccess ?
                                <CheckCircle2 size={24} />
                            :   <KeyRound size={24} />
                        : sent ?
                            <CheckCircle2 size={24} />
                        :   <Mail size={24} />}
                    </div>

                    <h1 className='text-2xl font-bold tracking-tight text-zinc-900 dark:text-white mb-2 text-center'>{token ? "Reset Password" : "Forgot Password"}</h1>

                    <p className='text-sm text-zinc-500 dark:text-zinc-400 text-center mb-8 leading-relaxed'>
                        {token ?
                            "Silakan masukkan kata sandi baru Anda di bawah ini untuk memulihkan akses akun."
                        :   "Masukkan email terdaftar Anda. Kami akan mengirimkan tautan aman untuk membuat kata sandi baru."}
                    </p>

                    <hr className='border-zinc-100 dark:border-zinc-900 my-6' />

                    {token ?
                        /* ================= ALUR 2: INPUT PASSWORD BARU ================= */
                        resetSuccess ?
                            <div className='space-y-2 text-center py-4'>
                                <p className='text-sm font-medium text-emerald-600 dark:text-emerald-400'>Password berhasil diperbarui!</p>
                                <p className='text-xs text-zinc-400'>Mengalihkan Anda ke halaman login secara otomatis...</p>
                            </div>
                        :   <div className='space-y-4'>
                                <div>
                                    <label className='block text-xs font-medium text-zinc-400 mb-1.5 uppercase tracking-wider'>Password Baru</label>
                                    <input
                                        type='password'
                                        placeholder='Minimal 6 karakter'
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className='w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/50 px-4 py-3 text-sm outline-none transition focus:border-purple-500 focus:ring-1 focus:ring-purple-500'
                                    />
                                </div>

                                <div>
                                    <label className='block text-xs font-medium text-zinc-400 mb-1.5 uppercase tracking-wider'>Konfirmasi Password Baru</label>
                                    <input
                                        type='password'
                                        placeholder='Ulangi password baru'
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        className='w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/50 px-4 py-3 text-sm outline-none transition focus:border-purple-500 focus:ring-1 focus:ring-purple-500'
                                    />
                                </div>

                                <button
                                    onClick={resetPassword}
                                    disabled={loading}
                                    className='w-full mt-2 px-6 py-3 bg-purple-700 dark:bg-purple-500 hover:bg-purple-800 dark:hover:bg-purple-600 disabled:opacity-50 text-white font-medium text-sm rounded-xl transition shadow-lg shadow-purple-500/10 flex items-center justify-center'>
                                    {loading ? "Memproses..." : "Perbarui Password"}
                                </button>
                            </div>

                    : /* ================= ALUR 1: MINTA LINK RESET ================= */
                    sent ?
                        <div className='space-y-2 text-center py-4'>
                            <p className='text-sm font-medium text-emerald-600 dark:text-emerald-400'>Tautan Pemulihan Terkirim</p>
                            <p className='text-xs text-zinc-400 leading-relaxed'>
                                Silakan periksa kotak masuk atau folder spam pada email <strong className='text-zinc-700 dark:text-zinc-300'>{email}</strong> kamu.
                            </p>
                        </div>
                    :   <div className='space-y-5'>
                            <div>
                                <label className='block text-xs font-medium text-zinc-400 mb-1.5 uppercase tracking-wider'>Alamat Email</label>
                                <input
                                    type='email'
                                    placeholder='nama@contoh.com'
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className='w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-950/50 px-4 py-3 text-sm outline-none transition focus:border-purple-500 focus:ring-1 focus:ring-purple-500'
                                />
                            </div>

                            <button
                                onClick={sendResetLink}
                                disabled={!email || loading}
                                className='w-full px-6 py-3 bg-purple-700 dark:bg-purple-500 hover:bg-purple-800 dark:hover:bg-purple-600 disabled:opacity-50 text-white font-medium text-sm rounded-xl transition shadow-lg shadow-purple-500/10 flex items-center justify-center'>
                                {loading ? "Mengirim..." : "Kirim Tautan Pemulihan"}
                            </button>
                        </div>
                    }
                </div>
            </main>
        </div>
    );
}
