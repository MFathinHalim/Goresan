"use client";

import React, { useState } from "react";
import Link from "next/link";
import { toast, Toaster } from "react-hot-toast";
import { useRouter } from "next/navigation";
import { useUser } from "@/context/userContext";

export default function Login() {
    const router = useRouter();
    const { login } = useUser();

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);

    const isValid = email && password;

    async function onLogin() {
        try {
            setLoading(true);
            await login(email, password);
            toast.success("Masuk berhasil");
            router.push("/");
        } catch (error: any) {
            const msg = error.response?.data?.error;
            if (msg === "EMAIL_NOT_VERIFIED") {
                toast.error("Email belum diverifikasi");
                router.push(`/verifyemail?email=${email}`);
                return;
            }
            toast.error(msg || "Login gagal");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className='min-h-screen flex bg-white dark:bg-zinc-950'>
            <Toaster />

            {/* KIRI — 1 gambar gede */}
            <div className='hidden md:block flex-1 relative overflow-hidden'>
                <img
                    src='https://wallpapers.com/images/hd/dark-purple-yae-miko-pfp-m1jepiolm6hykom3.jpg'
                    draggable={false}
                    className='absolute inset-0 w-full h-full object-cover'
                />

                {/* gradient kanan fade ke putih */}
                <div className='absolute inset-0 bg-gradient-to-r from-black/10 via-transparent to-white dark:to-zinc-950' />

                {/* tagline */}
                <div className='absolute bottom-10 left-8 z-10'>
                    <p className='text-2xl font-bold text-white drop-shadow leading-snug'>
                        Tempat karya
                        <br />
                        menemukan rumahnya.
                    </p>
                    <p className='text-sm text-white/60 mt-1 drop-shadow'>Platform galeri ilustrasi Indonesia</p>
                </div>
            </div>

            {/* KANAN — form */}
            <div className='flex flex-col justify-center items-center w-full md:w-[400px] shrink-0 px-8 py-16 relative'>
                {/* accent blur */}
                <div className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-purple-400/20 dark:bg-purple-600/20 rounded-full blur-3xl pointer-events-none' />

                <div className='relative z-10 w-full max-w-sm'>
                    {/* logo */}
                    <div className='mb-10'>
                        <h1 className='text-4xl font-bold text-purple-700 dark:text-purple-400'>Goresan</h1>
                        <p className='text-gray-400 text-sm mt-1'>Masuk ke akunmu</p>
                    </div>

                    <form
                        onSubmit={(e) => {
                            e.preventDefault();
                            if (isValid && !loading) onLogin();
                        }}
                        className='flex flex-col gap-5'>
                        <div className='flex flex-col gap-1.5'>
                            <label className='text-xs text-gray-400 uppercase tracking-widest'>Email</label>
                            <input
                                type='email'
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder='email@kamu.com'
                                className='w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-zinc-700 bg-white/60 dark:bg-zinc-900/60 backdrop-blur outline-none focus:border-purple-500 text-sm transition placeholder:text-gray-300'
                            />
                        </div>

                        <div className='flex flex-col gap-1.5'>
                            <label className='text-xs text-gray-400 uppercase tracking-widest'>Password</label>
                            <input
                                type='password'
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder='••••••••'
                                className='w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-zinc-700 bg-white/60 dark:bg-zinc-900/60 backdrop-blur outline-none focus:border-purple-500 text-sm transition placeholder:text-gray-300'
                            />
                        </div>

                        <div className='flex flex-col gap-1.5'>
                            <a
                                href='/forgotpassword'
                                className='text-sm text-purple-700 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-300 font-medium transition inline-flex items-center gap-1.5'>
                                Lupa Sandi? &rarr;
                            </a>
                        </div>

                        <button
                            disabled={!isValid || loading}
                            className='mt-2 w-full py-3 bg-purple-700 dark:bg-purple-500 text-white text-sm rounded-xl hover:bg-purple-800 dark:hover:bg-purple-600 disabled:opacity-30 transition font-medium'>
                            {loading ? "Masuk..." : "Masuk"}
                        </button>
                    </form>

                    <p className='text-sm text-gray-400 mt-6 text-center'>
                        Belum punya akun?{" "}
                        <Link href='/signup' className='text-purple-700 dark:text-purple-400 underline underline-offset-4'>
                            Daftar
                        </Link>
                    </p>
                </div>

                {/* mobile — gambar di atas form */}
                <div className='flex md:hidden w-full mb-8 order-first rounded-2xl overflow-hidden h-48 relative'>
                    <img src='https://i.pinimg.com/736x/5e/6c/21/5e6c213770d344f2c025e3dc68419322.jpg' draggable={false} className='w-full h-full object-cover' />
                    <div className='absolute inset-0 bg-gradient-to-b from-transparent to-white dark:to-zinc-950' />
                </div>
            </div>
        </div>
    );
}
