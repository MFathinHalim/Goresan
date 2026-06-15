import { NextRequest, NextResponse } from "next/server";

import { connect } from "@/dbConfig/dbConfig";

import Comment from "@/models/commentModel";

interface Params {
    params: {
        postId: string;
    };
}

export async function GET(req: NextRequest, { params }: Params) {
    await connect();

    const comments = await Comment.find({
        post: params.postId,
        parentComment: null,
    })

        .populate("user", "username profilePicture isVerified")

        .sort({
            createdAt: -1,
        });

    return NextResponse.json({
        success: true,
        comments,
    });
}

export async function DELETE(req: NextRequest, { params }: Params) {
    try {
        await connect();

        const { postId } = params;

        if (!postId) {
            return NextResponse.json({ success: false, error: "ID komentar tidak ditemukan" }, { status: 400 });
        }

        // Cari dan hapus komentar berdasarkan ID
        const deletedComment = await Comment.findByIdAndDelete(postId);

        if (!deletedComment) {
            return NextResponse.json({ success: false, error: "Komentar tidak ditemukan atau sudah dihapus" }, { status: 404 });
        }

        return NextResponse.json({
            success: true,
            message: "Komentar berhasil dihapus",
        });
    } catch (error: any) {
        return NextResponse.json({ success: false, error: error.message || "Terjadi kesalahan server" }, { status: 500 });
    }
}
