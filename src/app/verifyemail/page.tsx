"use client";

import React, { useEffect, useState } from "react";
import axios from "axios";
import { toast, Toaster } from "react-hot-toast";
import { useSearchParams } from "next/navigation";

export default function VerifyEmail() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [verified, setVerified] = useState(false);

  // ======================
  // AUTO VERIFY (token ada)
  // ======================
  const verifyWithToken = async (t: string) => {
    try {
      setLoading(true);

      await axios.post("/api/users/verifyemail", {
        token: t,
      });

      setVerified(true);
      toast.success("Email berhasil diverifikasi");
      window.location.href = "/login";
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

  // ======================
  // RESEND EMAIL (manual)
  // ======================
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
    <div
      className="min-h-[calc(100vh-64px)] flex items-center justify-center px-4"
    >
      <Toaster />

      {/* ======================
          MODE 1: TOKEN ADA
      ====================== */}
      {token ? (
        <div className="text-center">
          {loading && !verified && (
            <p className="text-xl">Memverifikasi email...</p>
          )}

          {verified && (
            <p className="text-xl text-green-600">
              Email berhasil diverifikasi
            </p>
          )}
        </div>
      ) : (
        /* ======================
           MODE 2: MANUAL RESEND
        ====================== */
        <div className="w-full max-w-md text-center">
          <h1 className="text-5xl mb-8">Verifikasi Email</h1>

          <input
            className="w-full border-b py-3 mb-6 outline-none"
            placeholder="email kamu"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <button
            onClick={resend}
            disabled={!email || loading}
            className="w-full border border-black py-3"
          >
            {loading ? "Mengirim..." : "Kirim ulang email verifikasi"}
          </button>
        </div>
      )}
    </div>
  );
}