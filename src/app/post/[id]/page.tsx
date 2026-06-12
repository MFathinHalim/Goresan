import { Metadata } from "next";
import PostDetailClient from "@/components/PostDetails"; // Pindahkan kode tampilan lama ke file baru ini

interface Props {
  params: { id: string };
}

// 1. FUNGSI UNTUK GENERATE EMBED/METADATA SPESIAL
export async function generateMetadata({ params }: Props) {
  try {
    // Ambil data langsung dari API internal atau Database
    const res = await fetch(`http://${process.env.NEXT_PUBLIC_SITE_URL || 'localhost:3000'}/api/posts/${params.id}`);
    const data = await res.json();
    const post = data?.post;

    if (!post) {
      return {
        title: "Post Tidak Ditemukan - Goresan",
      };
    }

    // Cek apakah post mengandung tag NSFW
    const isNSFW = post.tags?.some((t: string) => t.toLowerCase() === "nsfw");

    // Jika NSFW, samarkan gambar dan deskripsinya agar tidak bocor di embed Discord/WA
    const displayTitle = isNSFW ? `🔞 Konten Sensitif - ${post.title}` : post.title;
    const displayDesc = isNSFW ? "Konten ini ditandai sebagai NSFW. Buka situs untuk melihat." : (post.desc || "Lihat karya ini di Goresan.");
    const displayImage = isNSFW ? "https://goresan.vercel.app/nsfw-placeholder.png" : post.img; // Siapkan gambar placeholder nsfw di folder public

    return {
      title: `${displayTitle} | Goresan`,
      description: displayDesc,
      openGraph: {
        title: displayTitle,
        description: displayDesc,
        url: `https://goresan.vercel.app/post/${params.id}`,
        siteName: "Goresan",
        images: [
          {
            url: displayImage,
            width: 1200,
            height: 630,
            alt: post.title,
          },
        ],
        type: "article",
      },
      twitter: {
        card: "summary_large_image",
        title: displayTitle,
        description: displayDesc,
        images: [displayImage],
      },
    };
  } catch (error) {
    console.error("Error generating metadata:", error);
  }
}

// 2. HALAMAN UTAMA (SERVER COMPONENT)
export default function PostPage({ params }: Props) {
  return <PostDetailClient params={params} />;
}