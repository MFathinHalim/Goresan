import { NextRequest, NextResponse } from "next/server";
import Posts from "@/controllers/post";
import User from "@/models/userModel";
import { connect } from "@/dbConfig/dbConfig";
import { getDataFromToken } from "@/helpers/getDataFromToken"; // Pastikan helper ini di-import

const posts = Posts.getInstance();

export async function GET(req: NextRequest, { params }: { params: { username: string } }) {
  await connect();
  
  // 1. Cek status allowNSFW dari user yang sedang login/melihat halaman
  let allowNSFW = false;
  try {
    const currentUserId = getDataFromToken(req);
    const currentUser = await User.findById(currentUserId).select("age allowNSFW");
    allowNSFW = (currentUser?.age >= 18) && (currentUser?.allowNSFW === true);
  } catch {
    allowNSFW = false; // Jika token tidak valid / belum login, default ke false
  }

  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get("page") || "1");

  // 2. Cari target user pemilik profil
  const user = await User.findOne({
    $or: [{ username: params.username }, { _id: params.username }]
  }).select("-password");
  
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  // 3. Ambil data postingan milik user tersebut
  const result = await posts.getData(undefined, page, 12, user._id.toString());
  
  // 4. Lakukan filtering NSFW berdasarkan status izin viewer (orang yang melihat)
  const filteredPosts = allowNSFW
    ? result.posts
    : result.posts?.filter((p: any) =>
        !p.tags?.some((t: string) => t.toLowerCase() === "nsfw")
      );

  return NextResponse.json({ 
    user, 
    posts: filteredPosts,
    allowNSFW // Opsional: dikirim ke frontend jika dibutuhkan
  });
}