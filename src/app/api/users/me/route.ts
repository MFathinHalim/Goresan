import { NextRequest, NextResponse } from "next/server";
import User from "@/models/userModel";
import { connect } from "@/dbConfig/dbConfig";
import { getDataFromToken } from "@/helpers/getDataFromToken";

connect();

export async function GET(request: NextRequest) {
  try {
    const userId = getDataFromToken(request);
    const user = await User.findById(userId).select("-password");

    if (!user) {
      return NextResponse.json(
        { message: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      user, // 🔥 ganti data → user biar konsisten
      status: true,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}