import { NextRequest, NextResponse } from "next/server";
import { getDataFromToken } from "@/helpers/getDataFromToken";
import Post from "@/models/postModel";
import User from "@/models/userModel";
import { connect } from "@/dbConfig/dbConfig";

export async function GET(req: NextRequest) {
  await connect();
  try {
    const userId = getDataFromToken(req);
    const user = await User.findById(userId).select("age allowNSFW");
    const allowNSFW = (user?.age >= 18) && (user?.allowNSFW === true);

    const nsfwFilter = allowNSFW ? {} : { tags: { $nin: ["nsfw", "NSFW"] } };

    const posts = await Post.find({
      ...nsfwFilter,
      "like.users": userId,
    })
      .populate("user", "-password")
      .sort({ $natural: -1 })
      .exec();

    return NextResponse.json({ posts });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 401 });
  }
}