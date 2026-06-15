import { NextRequest, NextResponse } from "next/server";

import { connect } from "@/dbConfig/dbConfig";

import Comment from "@/models/commentModel";
import Post from "@/models/postModel";

export async function POST(req: NextRequest) {
    try {
        await connect();
        const body = await req.json();

        const {
            userId,
            postId,
            content,
            parentComment
        } = body;

        if (!content?.trim()) {
            return NextResponse.json(
                {
                success: false,
                message: "Comment kosong",
                },
                { status: 400 }
            );
        }

        const comment = await Comment.create({
            post: postId,
            user: userId,
            content,
            parentComment: parentComment || null,
        });

        await Post.findByIdAndUpdate(postId, {
            $inc: {
                commentCount: 1,
            },
        });

        return NextResponse.json({
            success: true,
            comment,
        });
    } catch (err: any) {
        console.error(err);
        
        return NextResponse.json({
            success: false,
            message: err.message,
        }, {
            status: 500,
        })
    }
}
