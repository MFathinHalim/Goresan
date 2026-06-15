import { NextRequest, NextResponse } from "next/server";
import User from "@/models/userModel";
import { connect } from "@/dbConfig/dbConfig";

export async function GET(req: NextRequest) {
    await connect();

    try {
        const { searchParams } = new URL(req.url);
        const email = searchParams.get("email");

        if (!email) {
            return NextResponse.json({ message: "Email harus diisi" }, { status: 400 });
        }

        // Cari user berdasarkan email
        const user = await User.findOne({ email }).select("isVerified");

        if (!user) {
            return NextResponse.json({ message: "User tidak ditemukan", exists: false }, { status: 404 });
        }

        return NextResponse.json({
            exists: true,
            isVerified: user.isVerified,
        });
    } catch (error: any) {
        return NextResponse.json({ message: error.message || "Terjadi kesalahan server" }, { status: 500 });
    }
}
