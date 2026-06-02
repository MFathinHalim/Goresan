import { NextRequest, NextResponse } from "next/server";
import Posts from "@/controllers/post";
import { getDataFromToken } from "@/helpers/getDataFromToken";
import User from "@/models/userModel";
import { connect } from "@/dbConfig/dbConfig";

const posts = Posts.getInstance();

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  const result = await posts.getData(params.id);
  if (!result.post) return NextResponse.json({ error: "Post not found" }, { status: 404 });
  return NextResponse.json(result);
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