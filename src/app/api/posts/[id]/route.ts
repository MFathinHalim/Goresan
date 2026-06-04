import { NextRequest, NextResponse } from "next/server";
import Posts from "@/controllers/post";
import { getDataFromToken } from "@/helpers/getDataFromToken";
import User from "@/models/userModel";
import { connect } from "@/dbConfig/dbConfig";

const posts = Posts.getInstance();

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  await connect();
  try {
    const result = await posts.getData(params.id);
    if (!result.post) return NextResponse.json({ error: "Post not found" }, { status: 404 });

    const isNSFW = result.post.tags?.some((t: string) => t.toLowerCase() === "nsfw");
    if (isNSFW) {
      let allowNSFW = false;
      try {
        const userId = getDataFromToken(req);
        const user = await User.findById(userId).select("age allowNSFW");
        allowNSFW = (user?.age >= 18) && (user?.allowNSFW === true);
      } catch {
        allowNSFW = false;
      }
      if (!allowNSFW) {
        return NextResponse.json({ error: "Konten ini dibatasi untuk usia 18+" }, { status: 403 });
      }
    }

    let userId = null;
    try { userId = getDataFromToken(req); } catch {}

    const likes = result.post.like?.users || [];
    const liked = userId && likes.some((u: any) => (u._id || u).toString() === userId.toString());

    return NextResponse.json({ post: result.post, liked, likeCount: likes.length });
  } catch {
    return NextResponse.json({ error: "Server Error" }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  await connect();
  try {
    const userId = getDataFromToken(req);
    const user = await User.findById(userId).select("-password");
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const success = await posts.deletePost(params.id);
    if (!success) return NextResponse.json({ error: "Gagal hapus post" }, { status: 500 });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}