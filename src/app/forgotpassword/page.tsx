"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast, Toaster } from "react-hot-toast";

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
            toast.error(
                e.response?.data?.message ||
                    "Gagal mengirim link reset password"
            );
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
            toast.error(
                e.response?.data?.message ||
                    "Token tidak valid atau sudah kedaluwarsa"
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-[calc(100vh-64px)] flex items-center justify-center px-4 bg-white dark:bg-zinc-950 text-black dark:text-white transition-colors">
            <Toaster />

            <div className="w-full max-w-md text-center">

                <h1 className="text-4xl sm:text-5xl mb-8 font-light">
                    {token ? "Reset Password" : "Forgot Password"}
                </h1>

                {token ? (
                    resetSuccess ? (
                        <div className="space-y-3">
                            <p className="text-green-600 dark:text-green-400">
                                Password berhasil diubah
                            </p>

                            <p className="text-sm text-zinc-500">
                                Mengalihkan ke halaman login...
                            </p>
                        </div>
                    ) : (
                        <>
                            <input
                                type="password"
                                placeholder="Password baru"
                                value={password}
                                onChange={(e) =>
                                    setPassword(e.target.value)
                                }
                                className="w-full border-b border-zinc-300 dark:border-zinc-700 py-3 mb-5 outline-none bg-transparent"
                            />

                            <input
                                type="password"
                                placeholder="Konfirmasi password baru"
                                value={confirmPassword}
                                onChange={(e) =>
                                    setConfirmPassword(e.target.value)
                                }
                                className="w-full border-b border-zinc-300 dark:border-zinc-700 py-3 mb-6 outline-none bg-transparent"
                            />

                            <button
                                onClick={resetPassword}
                                disabled={loading}
                                className="w-full border border-black dark:border-white py-3 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-900 disabled:opacity-50 transition"
                            >
                                {loading
                                    ? "Memproses..."
                                    : "Reset Password"}
                            </button>
                        </>
                    )
                ) : sent ? (
                    <div className="space-y-4">
                        <p className="text-green-600 dark:text-green-400">
                            Link reset password telah dikirim ke email kamu.
                        </p>

                        <p className="text-sm text-zinc-500">
                            Silakan cek inbox atau folder spam.
                        </p>
                    </div>
                ) : (
                    <>
                        <input
                            type="email"
                            className="w-full border-b border-zinc-300 dark:border-zinc-700 py-3 mb-6 outline-none bg-transparent focus:border-black dark:focus:border-white transition-colors"
                            placeholder="email kamu"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />

                        <button
                            onClick={sendResetLink}
                            disabled={!email || loading}
                            className="w-full border border-black dark:border-white py-3 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-900 disabled:opacity-50 transition"
                        >
                            {loading
                                ? "Mengirim..."
                                : "Kirim Link Reset Password"}
                        </button>
                    </>
                )}
            </div>
        </div>
    );
}

