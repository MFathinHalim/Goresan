"use client";

import React from "react";
import Link from "next/link";
import { ArrowLeft, Shield, Paintbrush, Scale, Eye } from "lucide-react";

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 selection:bg-purple-500/30">
      
      {/* HEADER UTAMA */}
      <header className="border-b border-zinc-100 dark:border-zinc-900 sticky top-0 bg-white/80 dark:bg-zinc-950/80 backdrop-blur z-50">
        <div className="max-w-4xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link 
            href="/signup" 
            className="flex items-center gap-2 text-sm text-zinc-500 hover:text-purple-700 dark:hover:text-purple-400 transition"
          >
            <ArrowLeft size={16} />
            <span>Kembali ke Pendaftaran</span>
          </Link>
          <span className="text-xs font-semibold uppercase tracking-widest text-zinc-400">
            Pembaruan Terakhir: Juni 2026
          </span>
        </div>
      </header>

      {/* KONTEN UTAMA */}
      <main className="max-w-3xl mx-auto px-6 py-12 md:py-20 relative">
        
        {/* Dekorasi Latar Belakang Minimalis */}
        <div className="absolute top-40 left-1/2 -translate-x-1/2 w-72 h-72 bg-purple-400/10 dark:bg-purple-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10">
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-zinc-900 dark:text-white mb-4">
            Ketentuan Layanan & Kebijakan Privasi
          </h1>
          <p className="text-zinc-500 dark:text-zinc-400 text-lg mb-12 max-w-xl leading-relaxed">
            Selamat datang di Goresan. Dokumen ini mengatur hak, kewajiban, dan perlindungan privasi bagi para kreator di platform kami.
          </p>

          <hr className="border-zinc-100 dark:border-zinc-900 my-8" />

          {/* BAGIAN 1: KETENTUAN LAYANAN */}
          <section className="space-y-8">
            <div className="flex items-center gap-3 text-purple-700 dark:text-purple-400">
              <Scale size={24} />
              <h2 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
                1. Ketentuan Penggunaan Platform
              </h2>
            </div>
            
            <div className="space-y-4 pl-9 text-zinc-600 dark:text-zinc-400 leading-relaxed text-sm md:text-base">
              <p>
                Dengan membuat akun di Goresan, Anda menyatakan telah berusia minimal 13 tahun atau memiliki izin dari orang tua atau wali hukum. Anda bertanggung jawab penuh atas keamanan kredensial akun Anda secara pribadi.
              </p>
              <p>
                Goresan berhak menangguhkan atau menghapus akun yang terbukti melakukan spam, penipuan, menyebarkan malware, atau mengganggu stabilitas infrastruktur platform demi kenyamanan komunitas.
              </p>
            </div>
          </section>

          <hr className="border-zinc-100 dark:border-zinc-900 my-8" />

          {/* BAGIAN 2: HAK CIPTA */}
          <section className="space-y-8">
            <div className="flex items-center gap-3 text-purple-700 dark:text-purple-400">
              <Paintbrush size={24} />
              <h2 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
                2. Hak Kekayaan Intelektual Kreator
              </h2>
            </div>
            
            <div className="space-y-4 pl-9 text-zinc-600 dark:text-zinc-400 leading-relaxed text-sm md:text-base">
              <p>
                <strong>Kepemilikan Penuh:</strong> Setiap ilustrasi, gambar, atau karya seni digital yang Anda unggah tetap menjadi milik Anda sepenuhnya. Goresan tidak mengambil alih hak cipta atas karya Anda.
              </p>
              <p>
                <strong>Lisensi Terbatas:</strong> Anda memberikan lisensi non-eksklusif, bebas royalti, dan berlaku di seluruh dunia kepada Goresan semata-mata untuk menampilkan, mendistribusikan, dan mempromosikan karya Anda di dalam platform atau media sosial resmi Goresan guna menjangkau audiens yang lebih luas.
              </p>
              <p>
                <strong>Konten Buatan AI:</strong> Jika karya Anda dibuat menggunakan bantuan Kecerdasan Buatan (AI), Anda diwajibkan memberikan label atau tag #AI pada postingan tersebut untuk transparansi komunitas.
              </p>
            </div>
          </section>

          <hr className="border-zinc-100 dark:border-zinc-900 my-8" />

          {/* BAGIAN 3: PRIVASI */}
          <section className="space-y-8">
            <div className="flex items-center gap-3 text-purple-700 dark:text-purple-400">
              <Eye size={24} />
              <h2 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
                3. Data yang Kami Kumpulkan
              </h2>
            </div>
            
            <div className="space-y-4 pl-9 text-zinc-600 dark:text-zinc-400 leading-relaxed text-sm md:text-base">
              <p>
                Kami mengumpulkan informasi pendaftaran seperti username, alamat email, dan kata sandi yang dienkripsi secara aman. Informasi ini murni digunakan untuk mengautentikasi identitas Anda dan mengirimkan verifikasi sistem.
              </p>
              <p>
                Goresan menggunakan kuki (cookies) fungsional untuk menyimpan preferensi tampilan Anda (seperti mode gelap atau mode terang) serta melacak interaksi dasar guna meningkatkan performa situs.
              </p>
            </div>
          </section>

          <hr className="border-zinc-100 dark:border-zinc-900 my-8" />

          {/* BAGIAN 4: KEAMANAN DATA */}
          <section className="space-y-8">
            <div className="flex items-center gap-3 text-purple-700 dark:text-purple-400">
              <Shield size={24} />
              <h2 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
                4. Keamanan dan Pembagian Data
              </h2>
            </div>
            
            <div className="space-y-4 pl-9 text-zinc-600 dark:text-zinc-400 leading-relaxed text-sm md:text-base">
              <p>
                Kami berkomitmen untuk tidak menjual, menyewakan, atau membagikan data pribadi Anda kepada pihak ketiga untuk kepentingan iklan komersial tanpa persetujuan eksplisit dari Anda.
              </p>
              <p>
                Enkripsi standar industri diterapkan untuk memitigasi risiko kebocoran data. Anda berhak meminta penghapusan akun beserta seluruh data terkait yang tersimpan di dalam database kami kapan saja melalui menu pengaturan profil.
              </p>
            </div>
          </section>

          <hr className="border-zinc-100 dark:border-zinc-900 my-12" />

          {/* FOOTER CALL TO ACTION */}
          <div className="bg-zinc-50 dark:bg-zinc-900/50 border border-zinc-100 dark:border-zinc-900 p-6 md:p-8 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-1 text-center md:text-left">
              <h3 className="font-semibold text-zinc-900 dark:text-white">Sudah memahami ketentuan kami?</h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400">Lanjutkan pembuatan akun Anda untuk mulai berbagi karya.</p>
            </div>
            <Link 
              href="/signup" 
              className="px-6 py-3 bg-purple-700 dark:bg-purple-500 hover:bg-purple-800 dark:hover:bg-purple-600 text-white font-medium text-sm rounded-xl transition shadow-lg shadow-purple-500/10 shrink-0"
            >
              Setuju dan Kembali
            </Link>
          </div>

        </div>
      </main>
    </div>
  );
}