import { NextRequest, NextResponse } from "next/server";
import User from "@/models/userModel";
import { connect } from "@/dbConfig/dbConfig";

connect();

export async function POST(req: NextRequest) {
  try {
    const { token } = await req.json();

    if (!token) {
      return NextResponse.json(
        { message: "Token tidak valid" },
        { status: 400 }
      );
    }

    const user = await User.findOne({
      verifyToken: token,
    });

    // 🔥 CASE 1: token gak ketemu
    if (!user) {
      return NextResponse.json(
        { message: "Link tidak valid atau sudah dipakai" },
        { status: 400 }
      );
    }

    // 🔥 CASE 2: sudah verified (IMPORTANT UX FIX)
    if (user.isVerified) {
      return NextResponse.json({
        message: "Akun sudah diverifikasi",
      });
    }

    // 🔥 CASE 3: expired token
    if (user.verifyTokenExpiry < Date.now()) {
      return NextResponse.json(
        { message: "Link verifikasi sudah expired" },
        { status: 400 }
      );
    }

    user.isVerified = true;
    user.verifyToken = undefined;
    user.verifyTokenExpiry = undefined;

    await user.save();

    return NextResponse.json({
      message: "Verifikasi berhasil",
    });
  } catch (err: any) {
    return NextResponse.json(
      { message: err.message },
      { status: 500 }
    );
  }
}