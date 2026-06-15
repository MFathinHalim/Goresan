import { NextRequest, NextResponse } from "next/server";
import User from "@/models/userModel";
import { connect } from "@/dbConfig/dbConfig";
import { sendEmail, EmailType } from "@/helpers/mailer";

export async function POST(req: NextRequest) {
    try {
        // 1. Hubungkan ke database Mongoose
        await connect();

        // 2. Ambil data email dari request JSON body frontend
        const { email } = await req.json();

        // 3. Validasi input email
        if (!email) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Email wajib diisi",
                },
                { status: 400 },
            );
        }

        // 4. Cari apakah user dengan email tersebut ada di database
        const user = await User.findOne({ email });

        if (!user) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Email tidak terdaftar atau salah",
                },
                { status: 404 },
            );
        }

        // 5. Panggil fungsi helper mailer yang baru untuk generate token & kirim email
        // Di dalam fungsi ini, MongoDB akan otomatis di-update dengan token reset baru
        await sendEmail({
            email: user.email,
            emailType: EmailType.RESET,
            userId: user._id,
        });

        // 6. Kembalikan response sukses ke frontend
        return NextResponse.json({
            success: true,
            message: "Link reset password berhasil dikirim ke email kamu",
        });
    } catch (error: any) {
        return NextResponse.json(
            {
                success: false,
                message: error.message || "Terjadi kesalahan pada server",
            },
            { status: 500 },
        );
    }
}
