import { NextRequest, NextResponse } from "next/server";
import Posts from "@/controllers/post";
import { getDataFromToken } from "@/helpers/getDataFromToken";
import User from "@/models/userModel";
import ImageKit from "imagekit";
import { connect } from "@/dbConfig/dbConfig";
import { detectNSFW } from "@/helpers/nsfwDetector";

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

  const result = await posts.getData(undefined, page, limit, undefined, search);
  const filtered = allowNSFW
    ? result.posts
    : result.posts?.filter((p: any) =>
        !p.tags?.some((t: string) => t.toLowerCase() === "nsfw")
      );

  return NextResponse.json({ posts: filtered });
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
    
    if (isNSFW && !tags.includes("nsfw")) {
      tags.push("nsfw");
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