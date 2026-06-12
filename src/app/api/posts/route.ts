import { NextRequest, NextResponse } from "next/server";
import Posts from "@/controllers/post";
import { getDataFromToken } from "@/helpers/getDataFromToken";
import User from "@/models/userModel";
import ImageKit from "imagekit";
import { connect } from "@/dbConfig/dbConfig";
import { detectNSFW } from "@/helpers/nsfwDetector";
import { detectAIImage } from "@/helpers/aiDetector";
import Post from "@/models/postModel";
import { LRUCache } from "lru-cache";

// 1. INISIALISASI RATE LIMITER (Maksimal 3 upload per 1 menit per User ID)
const uploadRateLimiter = new LRUCache<string, number>({
  max: 500,         // Kapasitas penyimpanan untuk 500 user aktif
  ttl: 1000 * 60,   // Reset hitungan setiap 1 menit (60.000 ms)
});

const imagekit = new ImageKit({
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY!,
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY!,
  urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT!,
});

const posts = Posts.getInstance();

export async function GET(req: NextRequest) {
  await connect();

  let allowNSFW = false;
  let userId: string | null = null;
  let userInteractions: any[] = [];

  try {
    userId = getDataFromToken(req);
    const user = await User.findById(userId).select("age allowNSFW interactions");
    allowNSFW = user && user.age >= 18 && user.allowNSFW === true;
    userInteractions = user?.interactions || [];
  } catch {
    allowNSFW = false;
  }

  const { searchParams } = new URL(req.url);
  const allowedAI = searchParams.get("allowedAI") === "true";

  const favoriteTags = userInteractions
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map(i => i.tag);

  const matchFilter: any = {};
  
  if (!allowNSFW) {
    matchFilter.tags = { ...matchFilter.tags, $nin: [/^nsfw$/i] };
  }
  if (!allowedAI) {
    if (!matchFilter.tags) matchFilter.tags = {};
    matchFilter.tags.$nin = [...(matchFilter.tags.$nin || []), /^ai$/i];
  }

  let pipeline: any[] = [
    { $match: matchFilter }
  ];

  if (favoriteTags.length > 0) {
    pipeline.push({
      $addFields: {
        isFavorite: {
          $cond: {
            if: { $gt: [{ $size: { $setIntersection: ["$tags", favoriteTags] } }, 0] },
            then: 1,
            else: 0
          }
        }
      }
    });
    
    pipeline.push({ $sort: { isFavorite: -1 } });
  }

  pipeline.push({ $sample: { size: 12 } });

  const randomPosts = await Post.aggregate(pipeline);

  return NextResponse.json({ 
    posts: randomPosts, 
    allowNSFW,
    allowedAI
  });
}

export async function POST(req: NextRequest) {
  await connect();
  try {
    const userId = getDataFromToken(req);
    const user = await User.findById(userId).select("-password");
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // VERIFIKASI RATE LIMIT (Mencegah Serangan Bot/Skrip)
    const currentUploadCount = uploadRateLimiter.get(userId.toString()) || 0;

    if (currentUploadCount >= 3) {
      return NextResponse.json(
        { error: "Aktivitas upload terlalu cepat. Silakan tunggu 1 menit lagi." },
        { status: 429 }
      );
    }
    uploadRateLimiter.set(userId.toString(), currentUploadCount + 1);

    const formData = await req.formData();
    const title = formData.get("title") as string;
    const desc = formData.get("desc") as string;
    const tags = (formData.get("tags") as string || "").split(",").map(t => t.trim()).filter(Boolean);
    const file = formData.get("file") as File;

    if (!file || !title) {
      return NextResponse.json({ error: "Title dan gambar wajib diisi" }, { status: 400 });
    }

    // Ambil raw buffer asli komponen gambar tanpa intervensi library pihak ketiga
    const rawBuffer = Buffer.from(await file.arrayBuffer());

    // Proses deteksi AI & NSFW berjalan dengan tipe asli file bawaan browser
    const isNSFW = await detectNSFW(rawBuffer, file.type);
    const isAI = await detectAIImage(rawBuffer, file.type);

    if (isNSFW && !tags.some(t => t.toLowerCase() === "nsfw")) {
      tags.push("nsfw");
    }
    if (isAI && !tags.some(t => t.toLowerCase() === "ai")) {
      tags.push("ai");
    }

    // Mengunggah file langsung ke ImageKit secara aman
    const uploaded = await imagekit.upload({
      file: rawBuffer,
      fileName: `${Date.now()}_${file.name.replace(/\s+/g, "_")}`,
      folder: "/goresan",
    });

    const post = await posts.posting(title, desc, uploaded.url, tags, user);
    return NextResponse.json({ post }, { status: 201 });
  } catch (error) {
    console.error("Error creating post:", error);
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}