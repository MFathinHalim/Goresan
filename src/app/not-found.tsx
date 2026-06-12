import Link from "next/link";

const NotFoundPage = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-white dark:bg-zinc-950 px-6 relative overflow-hidden select-none">
      
      {/* Accent Blur Efek Artistik */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-purple-500/10 dark:bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 text-center max-w-md w-full">
        {/* Kode Error dengan Efek Gradasi */}
        <h1 className="text-8xl md:text-9xl font-black tracking-tighter bg-gradient-to-b from-purple-600 to-purple-800 dark:from-purple-400 dark:to-purple-600 bg-clip-text text-transparent drop-shadow-sm">
          404
        </h1>
        
        {/* Status Utama */}
        <h2 className="text-xl md:text-2xl font-bold text-zinc-900 dark:text-zinc-100 mt-4 tracking-tight">
          Kanvas Tidak Ditemukan
        </h2>
        
        {/* Deskripsi Kontekstual */}
        <p className="mt-3 text-sm md:text-base text-zinc-400 dark:text-zinc-500 leading-relaxed">
          Halaman yang kamu cari tidak ada atau mungkin sudah dihapus oleh pemiliknya. Mari kembali ke galeri utama.
        </p>
        
        {/* Tombol Aksi Nyambung dengan Tema Sign Up */}
        <div className="mt-8">
          <Link
            href="/"
            className="inline-block px-8 py-3 bg-purple-700 dark:bg-purple-500 text-white text-sm font-medium rounded-xl hover:bg-purple-800 dark:hover:bg-purple-600 transition shadow-lg shadow-purple-700/10 dark:shadow-purple-500/5"
          >
            Kembali ke Beranda
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFoundPage;