import { NextRequest, NextResponse } from "next/server";
import Posts from "@/controllers/post";
import { getDataFromToken } from "@/helpers/getDataFromToken";
import User from "@/models/userModel";
import { connect } from "@/dbConfig/dbConfig";
import { trackInteraction } from "@/helpers/trackInteraction"; // Import helper yang kita bahas sebelumnya
import PostModel from "@/models/postModel"; // Import model Post kamu untuk ambil tags

const posts = Posts.getInstance();

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
    await connect();
    try {
        const userId = getDataFromToken(req);
        const user = await User.findById(userId).select("-password");
        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        // 1. Ambil data postingan sebelum di-like untuk mendapatkan tags-nya
        const targetPost = await PostModel.findById(params.id).select("tags");
        // 2. Jalankan fungsi liking bawaan kamu
        const totalLikes = await posts.liking(params.id, user);

        // 3. JALANKAN TRACKING ALGORITMA DI SINI
        // Jika postingan ketemu dan punya tags, kita beri bobot +3 karena "Like" adalah interaksi yang kuat
        if (targetPost && targetPost.tags && targetPost.tags.length > 0) {
            await trackInteraction(userId, targetPost.tags, 3);
        }

        return NextResponse.json({ totalLikes });
    } catch (error) {
        console.error("Error in like route:", error);
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
}
