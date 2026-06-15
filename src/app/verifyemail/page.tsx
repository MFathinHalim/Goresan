"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast, Toaster } from "react-hot-toast";

export default function VerifyEmail() {
    const [token, setToken] = useState<string | null>(null);

    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [verified, setVerified] = useState(false);

    // State baru untuk mengecek jika email tersebut ternyata sudah diverifikasi sebelumnya
    const [isAlreadyVerified, setIsAlreadyVerified] = useState(false);

    // Ambil token dari URL di client
    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        const t = params.get("token");
        setToken(t);
    }, []);

    const verifyWithToken = async (t: string) => {
        try {
            setLoading(true);

            await axios.post("/api/users/verifyemail", {
                token: t,
            });

            setVerified(true);
            toast.success("Email berhasil diverifikasi");

            setTimeout(() => {
                window.location.href = "/login";
            }, 800);
        } catch (e: any) {
            toast.error(e.response?.data?.message || "Token tidak valid");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (token) {
            verifyWithToken(token);
        }
    }, [token]);

    // Otomatis cek status verifikasi email saat user selesai mengetik email
    useEffect(() => {
        if (!email || token) return;

        // Beri jeda 600ms setelah ketikan berhenti agar tidak membanjiri request ke API
        const delayDebounceFn = setTimeout(async () => {
            try {
                const res = await axios.get(`/api/users/checkverification?email=${encodeURIComponent(email)}`);
                if (res.data.isVerified) {
                    setIsAlreadyVerified(true);
                } else {
                    setIsAlreadyVerified(false);
                }
            } catch (error) {
                // Reset jika email tidak ditemukan atau error
                setIsAlreadyVerified(false);
            }
        }, 600);

        return () => clearTimeout(delayDebounceFn);
    }, [email, token]);

    const resend = async () => {
        try {
            setLoading(true);

            await axios.post("/api/users/resendverification", {
                email,
            });

            toast.success("Link verifikasi dikirim ulang");
        } catch (e: any) {
            toast.error(e.response?.data?.message || "Gagal kirim email");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className='min-h-[calc(100vh-64px)] flex items-center justify-center px-4 bg-white dark:bg-zinc-950 text-black dark:text-white transition-colors'>
            <Toaster />

            {token ?
                <div className='text-center'>
                    {loading && !verified && <p className='text-xl animate-pulse'>Memverifikasi email...</p>}

                    {verified && <p className='text-xl text-green-600 dark:text-green-400 font-medium'>Email berhasil diverifikasi</p>}
                </div>
            :   <div className='w-full max-w-md text-center'>
                    <h1 className='text-4xl sm:text-5xl mb-8 font-light'>Verifikasi Email</h1>

                    <input
                        type='email'
                        className='w-full border-b border-zinc-300 dark:border-zinc-700 py-3 mb-4 outline-none bg-transparent focus:border-black dark:focus:border-white transition-colors'
                        placeholder='email kamu'
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />

                    {/* Kondisi pemberitahuan jika email sudah terverifikasi */}
                    {isAlreadyVerified ?
                        <div className='mb-6 text-center'>
                            <p className='text-green-600 dark:text-green-400 text-sm font-medium mb-3'>Sudah verified, silahkan login ✨</p>
                            <button
                                onClick={() => (window.location.href = "/login")}
                                className='w-full py-3 bg-purple-700 dark:bg-purple-500 text-white rounded-full hover:opacity-90 transition'>
                                Ke Halaman Login
                            </button>
                        </div>
                    :   <button
                            onClick={resend}
                            disabled={!email || loading}
                            className='w-full border border-black dark:border-white py-3 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-900 disabled:opacity-50 disabled:hover:bg-transparent transition'>
                            {loading ? "Mengirim..." : "Kirim ulang email verifikasi"}
                        </button>
                    }
                </div>
            }
        </div>
    );
}
