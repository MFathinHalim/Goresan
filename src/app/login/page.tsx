"use client";

import React, { useState } from "react";
import Link from "next/link";
import axios from "axios";
import { toast, Toaster } from "react-hot-toast";
import { useRouter } from "next/navigation";
import { useUser } from "@/context/userContext";

const FloatingArt = ({ className, src }: { className: string; src: string }) => (
  <img
    src={src}
    className={`absolute rounded-2xl object-cover border border-black/10 opacity-80 animate-float ${className}`}
    draggable={false}
  />
);

export default function Login() {
  const router = useRouter();
  const { fetchUser } = useUser();

  const [user, setUser] = useState({
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);

  const isValid = user.email && user.password;

  const { login } = useUser();

const onLogin = async () => {
  try {
    setLoading(true);

    await login(user.email, user.password);

    toast.success("Masuk berhasil");
    router.push("/");
  } catch (error: any) {
    const msg = error.response?.data?.error;

    if (msg === "EMAIL_NOT_VERIFIED") {
      toast.error("Email belum diverifikasi");
      router.push(`/verifyemail?email=${user.email}`);
      return;
    }

    toast.error(msg || "Login gagal");
  } finally {
    setLoading(false);
  }
};

  return (
    <div
      className="min-h-[calc(100vh-64px)] flex items-center justify-center relative overflow-hidden px-4"
    >
      {/* 🎨 floating art background */}
      <FloatingArt
        src="https://i.pinimg.com/1200x/c2/78/78/c278785922d279e360e7e0f9b420ce25.jpg"
        className="w-72 top-[-60px] left-[-60px] rotate-6"
      />
      <FloatingArt
        src="https://i.pinimg.com/736x/34/1d/47/341d47bd889baad279496b06b0d08686.jpg"
        className="w-64 bottom-[-40px] left-10 -rotate-6"
      />
      <FloatingArt
        src="https://i.pinimg.com/736x/7d/54/86/7d54865815e8a66f5c74f5a23aa5825c.jpg"
        className="w-80 top-10 right-[-80px] rotate-3"
      />

      {/* FORM */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (isValid && !loading) onLogin();
        }}
        className="relative z-10 w-full max-w-md"
      >
        {/* TITLE */}
        <h1 className="text-5xl text-center mb-10">Goresan</h1>

        {/* EMAIL */}
        <input
          className="w-full border-b py-3 mb-5 outline-none bg-transparent border-purple-700 dark:border-purple-400"
          placeholder="email"
          value={user.email}
          onChange={(e) =>
            setUser((p) => ({ ...p, email: e.target.value }))
          }
        />

        {/* PASSWORD */}
        <input
          type="password"
          className="w-full border-b py-3 mb-5 outline-none bg-transparent border-purple-700 dark:border-purple-400"
          placeholder="password"
          value={user.password}
          onChange={(e) =>
            setUser((p) => ({ ...p, password: e.target.value }))
          }
        />

        {/* BUTTON */}
        <button
          disabled={!isValid || loading}
          className="w-full bg-purple-700 dark:bg-purple-400 cursor-pointer dark:hover:bg-purple-700 text-white py-3 rounded-md transition"
        >
          {loading ? "Masuk..." : "Masuk"}
        </button>

        {/* LINK */}
        <p className="text-center mt-6">
          belum punya akun?{" "}
          <Link href="/signup" className="underline text-purple-700 dark:text-purple-300">
            daftar
          </Link>
        </p>
      </form>

      {/* animation */}
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