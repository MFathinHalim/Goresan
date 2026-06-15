import { NextRequest, NextResponse } from "next/server";
import bcryptjs from "bcryptjs";
import crypto from "crypto";

import User from "@/models/userModel";
import { connect } from "@/dbConfig/dbConfig";

export async function POST(req: NextRequest) {
    try {
        await connect();

        const { token, password } = await req.json();

        if (!token || !password) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Token dan password wajib diisi",
                },
                { status: 400 },
            );
        }

        const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

        const user = await User.findOne({
            resetPasswordToken: hashedToken,
            resetPasswordTokenExpiry: {
                $gt: new Date(),
            },
        });

        if (!user) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Token tidak valid atau sudah kedaluwarsa",
                },
                { status: 400 },
            );
        }

        const salt = await bcryptjs.genSalt(10);
        const hashedPassword = await bcryptjs.hash(password, salt);

        user.password = hashedPassword;
        user.resetPasswordToken = undefined;
        user.resetPasswordTokenExpiry = undefined;

        await user.save();

        return NextResponse.json({
            success: true,
            message: "Password berhasil direset",
        });
    } catch (error: any) {
        return NextResponse.json(
            {
                success: false,
                message: error.message,
            },
            { status: 500 },
        );
    }
}
