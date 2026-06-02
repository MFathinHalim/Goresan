import { NextRequest, NextResponse } from "next/server";
import Posts from "@/controllers/post";
import User from "@/models/userModel";
import { connect } from "@/dbConfig/dbConfig";

const posts = Posts.getInstance();

export async function GET(req: NextRequest, { params }: { params: { username: string } }) {
  await connect();
  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get("page") || "1");

    const user = await User.findOne({
    $or: [{ username: params.username }, { _id: params.username }]
    }).select("-password");
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const result = await posts.getData(undefined, page, 12, user._id.toString());
  return NextResponse.json({ user, posts: result.posts });
}