import { NextRequest, NextResponse } from "next/server";
import Posts from "@/controllers/post";
import { getDataFromToken } from "@/helpers/getDataFromToken";
import User from "@/models/userModel";
import ImageKit from "imagekit";
import { connect } from "@/dbConfig/dbConfig";
import { detectNSFW } from "@/helpers/nsfwDetector";
import { detectAIImage } from "@/helpers/aiDetector";
import Post from "@/models/postModel";

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

  // Ambil data user yang sedang login jika ada
  try {
    userId = getDataFromToken(req);
    const user = await User.findById(userId).select("age allowNSFW interactions");
    allowNSFW = (user?.age >= 18) && (user?.allowNSFW === true);
    userInteractions = user?.interactions || [];
  } catch {
    allowNSFW = false;
  }

  const { searchParams } = new URL(req.url);
  const allowedAI = searchParams.get("allowedAI") === "true";

  // 1. Ambil 3 tag teratas yang paling disukai user (skor tertinggi)
  const favoriteTags = userInteractions
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map(i => i.tag);

  // 2. Bangun Query Filter Dasar (Mengikuti aturan NSFW & AI sebelumnya)
  const matchFilter: any = {};
  
  if (!allowNSFW) {
    matchFilter.tags = { ...matchFilter.tags, $nin: [/^nsfw$/i] };
  }
  if (!allowedAI) {
    if (!matchFilter.tags) matchFilter.tags = {};
    matchFilter.tags.$nin = [...(matchFilter.tags.$nin || []), /^ai$/i];
  }

  // 3. Jalankan Aggregation Pipeline untuk Algoritma Rekomendasi Random
  let pipeline: any[] = [
    { $match: matchFilter } // Saring dulu NSFW dan AI agar tidak bocor
  ];

  if (favoriteTags.length > 0) {
    // Jika user punya minat, gunakan $addFields untuk memberikan nilai "bobot" 
    // pada postingan yang memiliki tag kesukaan mereka
    pipeline.push({
      $addFields: {
        isFavorite: {
          $cond: {
            if: { $gt: [{ $size: { $setIntersection: ["$tags", favoriteTags] } }, 0] },
            then: 1, // Beri tanda jika ada tag yang cocok
            else: 0
          }
        }
      }
    });
    
    // Urutkan berdasarkan konten favorit dulu, lalu sisanya di-random
    pipeline.push({ $sort: { isFavorite: -1 } });
  }

  // Ambil sampel secara acak dari database agar bervariasi (misal limit 12)
  // Menggunakan $sample membuat hasilnya selalu terasa baru dan "random" bagi user
  pipeline.push({ $sample: { size: 12 } });

  // Jalankan query aggregation langsung ke Model Post Mongoose kamu
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

    const formData = await req.formData();
    const title = formData.get("title") as string;
    const desc = formData.get("desc") as string;
    const tags = (formData.get("tags") as string || "").split(",").map(t => t.trim()).filter(Boolean);
    const file = formData.get("file") as File;

    if (!file || !title) {
      return NextResponse.json({ error: "Title dan gambar wajib diisi" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());

    const isNSFW = await detectNSFW(
      buffer,
      file.type
    );
    const isAI = await detectAIImage(
      buffer,
      file.type
    );
    console.log(isAI);
    if (isNSFW && !tags.includes("nsfw")) {
      tags.push("nsfw");
    }
    if (isAI && !tags.includes("ai")) {
      tags.push("ai");
    }
    const uploaded = await imagekit.upload({
      file: buffer,
      fileName: file.name,
      folder: "/goresan",
    });

    const post = await posts.posting(title, desc, uploaded.url, tags, user);
    return NextResponse.json({ post }, { status: 201 });
  } catch (error) {
    console.error("Error creating post:", error);
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}