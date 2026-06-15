//@ts-nocheck
import { NextRequest, NextResponse } from "next/server";
import Posts from "@/controllers/post";
import User from "@/models/userModel";
import { connect } from "@/dbConfig/dbConfig";
import { getDataFromToken } from "@/helpers/getDataFromToken";

const posts = Posts.getInstance();

export async function GET(req: NextRequest, { params }: { params: { username: string } }) {
    await connect();

    // 1. Ambil ID user yang sedang login saat ini (jika ada)
    let currentUserId: string | null = null;
    try {
        currentUserId = getDataFromToken(req);
    } catch {
        currentUserId = null; // Guest / belum login
    }

    // 2. Cari target user pemilik profil
    // Menggunakan .lean() agar menghasilkan objek JavaScript biasa (bukan Mongoose document)
    // yang datanya jauh lebih mudah dimanipulasi/dihapus sebelum dikirim ke client.
    const user = await User.findOne({
        $or: [{ username: params.username }, { _id: params.username }],
    })
        .select("-password")
        .lean();

    if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

    // 3. Cek status perizinan NSFW & Hak Akses Data Sensitif
    let allowNSFW = false;
    const isOwner = currentUserId === user._id.toString();

    if (isOwner) {
        // JIKA YANG MELIHAT ADALAH SI PEMILIK PROFIL ITU SENDIRI -> Izinkan semuanya
        allowNSFW = true;
    } else {
        // JIKA ORANG LAIN / GUEST YANG MELIHAT -> Hapus total seluruh data sensitif demi privasi
        delete user.email;
        delete user.isAdmin;
        delete user.isVerified;
        delete user.forgotPasswordToken;
        delete user.forgotPasswordTokenExpiry;
        delete user.verifyToken;
        delete user.verifyTokenExpiry;
        delete user.interactions; // Ikut dihapus karena ini data algoritma internal pencarian user

        if (currentUserId) {
            // Jika orang lain yang melihat sudah login, jalankan filter umur + settingan akun
            const currentUser = await User.findById(currentUserId).select("age allowNSFW");
            allowNSFW = currentUser?.age >= 18 && currentUser?.allowNSFW === true;
        } else {
            allowNSFW = false; // Guest default ke false
        }
    }

    const { searchParams } = new URL(req.url);
    const page = parseInt(searchParams.get("page") || "1");

    // 4. Ambil data postingan milik user tersebut
    const result = await posts.getData(undefined, page, 12, user._id.toString());

    // 5. Lakukan filtering berdasarkan keputusan variabel allowNSFW di atas
    const filteredPosts = allowNSFW ? result.posts : result.posts?.filter((p: any) => !p.tags?.some((t: string) => t.toLowerCase() === "nsfw"));

    return NextResponse.json({
        user,
        posts: filteredPosts,
        allowNSFW,
    });
}
