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

// FIX 1: Paksa Next.js agar tidak menyentuh file ini sebagai static page saat build
export const dynamic = "force-dynamic";

// FIX 2: Ambil global cache singleton agar LRUCache tidak ter-reset setiap kali API di-hit di Vercel
const globalForCache = global as unknown as { uploadRateLimiter: LRUCache<string, number> };
if (!globalForCache.uploadRateLimiter) {
  globalForCache.uploadRateLimiter = new LRUCache<string, number>({
    max: 500,
    ttl: 1000 * 60,
  });
}
const uploadRateLimiter = globalForCache.uploadRateLimiter;

// Fungsi pembantu untuk membuat instance ImageKit saat runtime
function getImageKitInstance() {
  return new ImageKit({
    publicKey: process.env.IMAGEKIT_PUBLIC_KEY!,
    privateKey: process.env.IMAGEKIT_PRIVATE_KEY!,
    urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT!,
  });
}

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

    // VERIFIKASI RATE LIMIT
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

    const rawBuffer = Buffer.from(await file.arrayBuffer());

    const isNSFW = await detectNSFW(rawBuffer, file.type);
    const isAI = await detectAIImage(rawBuffer, file.type);

    if (isNSFW && !tags.some(t => t.toLowerCase() === "nsfw")) {
      tags.push("nsfw");
    }
    if (isAI && !tags.some(t => t.toLowerCase() === "ai")) {
      tags.push("ai");
    }

    // Inisialisasi ImageKit aman di dalam runtime fungsi
    const imagekit = getImageKitInstance();
    const uploaded = await imagekit.upload({
      file: rawBuffer,
      fileName: `${Date.now()}_${file.name.replace(/\s+/g, "_")}`,
      folder: "/goresan",
    });

    const posts = Posts.getInstance();
    const post = await posts.posting(title, desc, uploaded.url, tags, user);
    return NextResponse.json({ post }, { status: 201 });
  } catch (error) {
    console.error("Error creating post:", error);
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}