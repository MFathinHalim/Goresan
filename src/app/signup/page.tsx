"use client";

import React, { useState } from "react";
import Link from "next/link";
import axios from "axios";
import { toast, Toaster } from "react-hot-toast";
import { useRouter } from "next/navigation";

const FloatingArt = ({ className, src }: { className: string; src: string }) => (
  <img
    src={src}
    className={`absolute rounded-2xl object-cover border border-black/10 opacity-80 animate-float ${className}`}
    draggable={false}
  />
);

export default function SignUp() {
  const router = useRouter();

  const [user, setUser] = useState({
    username: "",
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const isValid = user.username && user.email && user.password;

  const onSignUp = async () => {
    try {
      setLoading(true);

      await axios.post("/api/users/signup", user);

      setSent(true);
      toast.success("Cek email kamu untuk verifikasi");

      setTimeout(() => {
        router.push("/verifyemail");
      }, 1200);
    } catch {
      toast.error("Gagal daftar");
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-[calc(100vh-64px)] flex items-center justify-center relative overflow-hidden px-4"
    >
      {/* decor */}
      <FloatingArt src="https://i.pinimg.com/1200x/c2/78/78/c278785922d279e360e7e0f9b420ce25.jpg" className="w-72 top-[-60px] left-[-60px] rotate-6" />
      <FloatingArt src="https://i.pinimg.com/736x/34/1d/47/341d47bd889baad279496b06b0d08686.jpg" className="w-64 bottom-[-40px] left-10 -rotate-6" />
      <FloatingArt src="https://i.pinimg.com/736x/7d/54/86/7d54865815e8a66f5c74f5a23aa5825c.jpg" className="w-80 top-10 right-[-80px] rotate-3" />

      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (isValid && !loading) onSignUp();
        }}
        className="relative z-10 w-full max-w-md"
      >
        <h1 className="text-5xl text-center mb-10">Goresan</h1>

        <input
          className="w-full border-b py-3 mb-5 outline-none bg-transparent border-purple-700 dark:border-purple-400"
          placeholder="username"
          value={user.username}
          onChange={(e) => setUser((p) => ({ ...p, username: e.target.value }))}
        />

        <input
          className="w-full border-b py-3 mb-5 outline-none bg-transparent border-purple-700 dark:border-purple-400"
          placeholder="email"
          value={user.email}
          onChange={(e) => setUser((p) => ({ ...p, email: e.target.value }))}
        />

        <input
          type="password"
          className="w-full border-b py-3 mb-5 outline-none bg-transparent border-purple-700 dark:border-purple-400"
          placeholder="password"
          value={user.password}
          onChange={(e) => setUser((p) => ({ ...p, password: e.target.value }))}
        />

        <button
          disabled={!isValid || loading}
          className="w-full bg-purple-700 dark:bg-purple-400 cursor-pointer dark:hover:bg-purple-700 text-white py-3 rounded-md transition"
        >
          {loading ? "Mengirim..." : "Buat akun"}
        </button>

        {sent && (
          <p className="text-center text-sm text-gray-500 mt-4">
            kami sudah kirim link verifikasi ke email kamu
          </p>
        )}

        <p className="text-center mt-6">
          sudah punya akun?{" "}
          <Link href="/login" className="underline text-purple-700 dark:text-purple-300">
            masuk
          </Link>
        </p>
      </form>

      <style jsx>{`
        .animate-float {
          animation: float 7s ease-in-out infinite;
        }
        @keyframes float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-25px); }
          100% { transform: translateY(0px); }
        }
      `}</style>

      <Toaster />
    </div>
  );
}