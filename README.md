Berikut adalah dokumentasi README.md yang profesional, bersih, dan terstruktur dengan baik untuk proyek Goresan.

---

# Goresan

Goresan adalah platform berbasis web yang dirancang khusus untuk para kreator dan seniman digital untuk membagikan karya mereka. Dibangun dengan Next.js dan MongoDB, platform ini mengintegrasikan kecerdasan buatan untuk menjaga keamanan komunitas melalui deteksi otomatis konten sensitif dan klasifikasi gambar buatan AI.

Tautan Aplikasi: [https://goresan.vercel.app](https://goresan.vercel.app)

Repositori GitHub: [https://github.com/MFathinHalim/Goresan](https://github.com/MFathinHalim/Goresan)

## Fitur Utama

### Autentikasi dan Manajemen Pengguna

- Pendaftaran akun baru dengan sistem verifikasi email otomatis.
- Autentikasi masuk menggunakan enkripsi kata sandi berbasis Bcrypt.
- Pemulihan akun melalui fitur lupa kata sandi dengan token aman berbasis SHA-256 yang dikirimkan ke email pengguna.
- Pengaturan profil kustomisasi umur dan preferensi tampilan konten.

### Keamanan Konten Berbasis AI

- Deteksi otomatis konten sensitif (NSFW) pada gambar yang diunggah menggunakan integrasi Hugging Face API.
- Identifikasi otomatis untuk gambar yang dihasilkan oleh kecerdasan buatan (AI Generated Content) demi transparansi komunitas.
- Sistem penyaringan konten (Hide/Show NSFW) yang dikendalikan secara dinamis berdasarkan verifikasi umur pengguna di atas 18 tahun.

### Interaksi dan Eksplorasi

- Unggah dan manajemen aset gambar yang dioptimalkan melalui integrasi Imagekit.io.
- Fitur pencarian berbasis teks untuk mempermudah eksplorasi karya di dalam platform.
- Sistem pelaporan (Report) konten yang melanggar panduan komunitas untuk ditinjau lebih lanjut.

## Teknologi Yang Digunakan

### Frontend dan Backend

- Next.js (App Router)
- TypeScript
- Tailwind CSS

### Basis Data dan Penyimpanan Aset

- MongoDB dan Mongoose Object Data Modeling (ODM)
- Imagekit.io SDK untuk manajemen dan optimasi media Gambar

### Layanan Pihak Ketiga

- Hugging Face Inference API (Model Klasifikasi NSFW dan Deteksi Gambar AI)
- Nodemailer untuk layanan pengiriman email sistem

## Panduan Instalasi

### Prasyarat

Pastikan Anda telah menginstal Node.js versi terbaru dan memiliki akun aktif di MongoDB Atlas, Imagekit.io, serta Hugging Face.

### Langkah Pertama

Kloning repositori ini ke dalam direktori lokal Anda.

```bash
git clone https://github.com/MFathinHalim/Goresan.git
cd Goresan

```

### Langkah Kedua

Instal semua dependensi yang diperlukan oleh proyek.

```bash
npm install

```

### Langkah Ketiga

Buat sebuah file bernama `.env` pada direktori utama proyek Anda dan isi variabel lingkungan di bawah ini sesuai dengan kredensial layanan Anda.

```env
# Konfigurasi Aplikasi dan Basis Data
DOMAIN=http://localhost:3000
MONGODB_URI=your_mongodb_connection_string

# Kredensial Imagekit.io
IMAGEKIT_PUBLIC_KEY=your_imagekit_public_key
IMAGEKIT_PRIVATE_KEY=your_imagekit_private_key
IMAGEKIT_URL_ENDPOINT=your_imagekit_url_endpoint

# Kredensial Hugging Face API
HUGGINGFACE_API_KEY=your_huggingface_api_key

# Konfigurasi Pengiriman Email (Nodemailer)
NODE_MAILER_USER=your_gmail_address
NODE_MAILER_PASSWORD=your_gmail_app_password
NODE_MAILER_FROM_MAIL=your_gmail_address

```

### Langkah Keempat

Jalankan server pengembangan lokal.

```bash
npm run dev

```

Buka browser Anda dan akses halaman http://localhost:3000 untuk melihat aplikasi yang berjalan di lingkungan lokal.

## Kontribusi

Jika Anda ingin berkontribusi pada pengembangan Goresan, silakan buat fork pada repositori ini, lakukan perubahan pada branch fitur Anda, dan kirimkan sebuah Pull Request untuk ditinjau oleh pengembang utama.
