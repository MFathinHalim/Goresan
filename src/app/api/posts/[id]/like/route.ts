import { NextRequest, NextResponse } from "next/server";
import Posts from "@/controllers/post";
import { getDataFromToken } from "@/helpers/getDataFromToken";
import User from "@/models/userModel";
import { connect } from "@/dbConfig/dbConfig";

const posts = Posts.getInstance();

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  await connect();
  try {
    const userId = getDataFromToken(req);
    const user = await User.findById(userId).select("-password");
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const totalLikes = await posts.liking(params.id, user);
    return NextResponse.json({ totalLikes });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}