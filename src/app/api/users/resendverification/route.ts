import { NextRequest, NextResponse } from "next/server";
import { connect } from "@/dbConfig/dbConfig";
import User from "@/models/userModel";
import { EmailType, sendEmail } from "@/helpers/mailer";

connect();

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json();

    if (!email) {
      return NextResponse.json(
        { message: "Email wajib diisi" },
        { status: 400 }
      );
    }

    const user = await User.findOne({ email });

    if (!user) {
      return NextResponse.json(
        { message: "User tidak ditemukan" },
        { status: 404 }
      );
    }

    // kalau sudah verified
    if (user.isVerified) {
      return NextResponse.json({
        message: "Akun sudah diverifikasi",
      });
    }

    // kirim ulang email verifikasi
    await sendEmail({
      email: user.email,
      emailType: EmailType.VERIFY,
      userId: user._id,
    });

    return NextResponse.json({
      message: "Email verifikasi dikirim ulang",
      success: true,
    });
  } catch (error: any) {
    return NextResponse.json(
      { message: error.message },
      { status: 500 }
    );
  }
}