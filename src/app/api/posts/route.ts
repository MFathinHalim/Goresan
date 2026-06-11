import { NextRequest, NextResponse } from "next/server";
import Posts from "@/controllers/post";
import { getDataFromToken } from "@/helpers/getDataFromToken";
import User from "@/models/userModel";
import ImageKit from "imagekit";
import { connect } from "@/dbConfig/dbConfig";
import { detectNSFW } from "@/helpers/nsfwDetector";
import { detectAIImage } from "@/helpers/aiDetector";

const imagekit = new ImageKit({
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY!,
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY!,
  urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT!,
});

const posts = Posts.getInstance();

export async function GET(req: NextRequest) {
  await connect();

  let allowNSFW = false;
  try {
    const userId = getDataFromToken(req);
    const user = await User.findById(userId).select("age allowNSFW");
    allowNSFW = (user?.age >= 18) && (user?.allowNSFW === true);
  } catch {
    allowNSFW = false;
  }

  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get("page") || "1");
  const limit = parseInt(searchParams.get("limit") || "12");
  const search = searchParams.get("search") || "";
  
  // Mengambil query param allowedAI (default: false jika tidak diisi atau bukan "true")
  const allowedAI = searchParams.get("allowedAI") === "true";

  const result = await posts.getData(undefined, page, limit, undefined, search);
  
  // 1. Filter untuk NSFW
  let filtered = allowNSFW
    ? result.posts
    : result.posts?.filter((p: any) =>
        !p.tags?.some((t: string) => t.toLowerCase() === "nsfw")
      );
  
  // 2. Filter untuk AI (Hanya disaring jika allowedAI bernilai false)
  if (!allowedAI) {
    filtered = filtered?.filter((p: any) =>
      !p.tags?.some((t: string) => t.toLowerCase() === "ai")
    );
  }

  // Tambahkan data allowNSFW dan allowedAI ke dalam response JSON (opsional, agar frontend tahu statusnya)
  return NextResponse.json({ 
    posts: filtered, 
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