import { NextRequest, NextResponse } from "next/server";
import User from "@/models/userModel";
import { getDataFromToken } from "@/helpers/getDataFromToken";
import { connect } from "@/dbConfig/dbConfig";
import ImageKit from "imagekit";

const imagekit = new ImageKit({
  publicKey: process.env.IMAGEKIT_PUBLIC_KEY!,
  privateKey: process.env.IMAGEKIT_PRIVATE_KEY!,
  urlEndpoint: process.env.IMAGEKIT_URL_ENDPOINT!,
});

export async function PUT(req: NextRequest) {
  await connect();
  try {
    const userId = getDataFromToken(req);
    const formData = await req.formData();

    const username = formData.get("username") as string;
    const description = formData.get("description") as string;
    const file = formData.get("profilePicture") as File | null;

    let profilePictureUrl: string | undefined;

    if (file && file.size > 0) {
      const buffer = Buffer.from(await file.arrayBuffer());
      const uploaded = await imagekit.upload({
        file: buffer,
        fileName: file.name,
        folder: "/goresan/avatars",
      });
      profilePictureUrl = uploaded.url;
    }

    const updateData: any = { username, description };
    if (profilePictureUrl) updateData.profilePicture = profilePictureUrl;

    const user = await User.findByIdAndUpdate(userId, updateData, { new: true }).select("-password");

    return NextResponse.json({ success: true, user });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}