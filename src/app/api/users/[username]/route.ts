import { NextRequest, NextResponse } from "next/server";
import Posts from "@/controllers/post";
import User from "@/models/userModel";
import { connect } from "@/dbConfig/dbConfig";
import { getDataFromToken } from "@/helpers/getDataFromToken";

const posts = Posts.getInstance();

export async function GET(req: NextRequest, { params }: { params: { username: string } }) {
  await connect();
  
  // 1. Cari target user pemilik profil terlebih dahulu
  const user = await User.findOne({
    $or: [{ username: params.username }, { _id: params.username }]
  }).select("-password");
  
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  // 2. Cek status perizinan NSFW (Viewer vs Pemilik)
  let allowNSFW = false;
  try {
    const currentUserId = getDataFromToken(req);
    
    // JIKA YANG MELIHAT ADALAH SI PEMILIK PROFIL ITU SENDIRI -> Langsung izinkan lihat semua
    if (currentUserId === user._id.toString()) {
      allowNSFW = true;
    } else {
      // Jika orang lain yang melihat, jalankan filter umur + settingan akun seperti biasa
      const currentUser = await User.findById(currentUserId).select("age allowNSFW");
      allowNSFW = (currentUser?.age >= 18) && (currentUser?.allowNSFW === true);
    }
  } catch {
    allowNSFW = false; // Jika belum login / guest, default ke false (aman dari NSFW)
  }

  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get("page") || "1");

  // 3. Ambil data postingan milik user tersebut
  const result = await posts.getData(undefined, page, 12, user._id.toString());
  
  // 4. Lakukan filtering berdasarkan keputusan variabel allowNSFW di atas
  const filteredPosts = allowNSFW
    ? result.posts
    : result.posts?.filter((p: any) =>
        !p.tags?.some((t: string) => t.toLowerCase() === "nsfw")
      );

  return NextResponse.json({ 
    user, 
    posts: filteredPosts,
    allowNSFW
  });
}