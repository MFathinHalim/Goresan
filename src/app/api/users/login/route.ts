import { NextRequest, NextResponse } from "next/server";
import User from "@/models/userModel";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { connect } from "@/dbConfig/dbConfig";

connect();

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    const user = await User.findOne({ email });

    if (!user) {
      return NextResponse.json(
        { error: "User tidak ditemukan" },
        { status: 400 }
      );
    }

    const isValid = await bcrypt.compare(password, user.password);

    if (!isValid) {
      return NextResponse.json(
        { error: "Password salah" },
        { status: 400 }
      );
    }

    if (!user.isVerified) {
      return NextResponse.json(
        { error: "EMAIL_NOT_VERIFIED" },
        { status: 403 }
      );
    }

    const token = jwt.sign(
      {
        id: user._id,
        username: user.username,
        email: user.email,
      },
      process.env.TOKEN_SECRET!,
      { expiresIn: "7d" }
    );

    const res = NextResponse.json({
      message: "Login berhasil",
    });

    res.cookies.set("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7,
    });

    return res;
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message },
      { status: 500 }
    );
  }
}