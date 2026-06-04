import { NextRequest, NextResponse } from "next/server";
import Post from "@/models/postModel";
import User from "@/models/userModel";
import { getDataFromToken } from "@/helpers/getDataFromToken";
import { connect } from "@/dbConfig/dbConfig";

export async function GET(req: NextRequest) {
  await connect();

  try {
    const { searchParams } = new URL(req.url);

    const q = searchParams.get("q")?.trim() || "";
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "12");

    if (!q) return NextResponse.json({ posts: [], users: [] });

    let allowNSFW = false;
    try {
      const userId = getDataFromToken(req);
      const user = await User.findById(userId).select("age allowNSFW");
      allowNSFW = (user?.age >= 18) && (user?.allowNSFW === true);
    } catch {
      allowNSFW = false;
    }

    const words = q.split(" ").filter(Boolean);

    const wordFilters = words.map(word => {
      const regex = new RegExp(word, "i");
      return {
        $or: [
          { title: regex },
          { desc: regex },
          { tags: regex },
        ],
      };
    });

    const nsfwFilter = allowNSFW
      ? {}
      : { tags: { $nin: ["nsfw", "NSFW"] } };

    const skip = (page - 1) * limit;

    const [posts, users] = await Promise.all([
      Post.find({
        ...nsfwFilter,
        $and: wordFilters,
      })
        .populate("user", "-password")
        .sort({ _id: -1 }) // lebih stabil dari $natural
        .skip(skip)
        .limit(limit)
        .exec(),

      // users gak dipaginasi dulu (biasanya kecil)
      User.find({ username: new RegExp(q, "i") })
        .select("-password")
        .limit(10)
        .exec(),
    ]);

    return NextResponse.json({
      posts,
      users,
      hasMore: posts.length === limit,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}