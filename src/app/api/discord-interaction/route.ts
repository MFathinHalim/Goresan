import { NextRequest, NextResponse } from "next/server";
import { connect } from "@/dbConfig/dbConfig";
import PostModel from "@/models/postModel";
// Pastikan path model komentar ini sudah sesuai dengan proyekmu
import CommentModel from "@/models/commentModel";
import nacl from "tweetnacl";

// Helper untuk mengubah string hex menjadi Uint8Array
function hexToUint8Array(hexString: string): Uint8Array {
    const pairs = hexString.match(/[\da-f]{2}/gi) || [];
    return new Uint8Array(pairs.map((h) => parseInt(h, 16)));
}

// Fungsi memverifikasi bahwa request benar-benar asli dikirim oleh Discord
async function verifyDiscordRequest(request: NextRequest, bodyText: string) {
    const signature = request.headers.get("x-signature-ed25519");
    const timestamp = request.headers.get("x-signature-timestamp");
    const publicKey = process.env.DISCORD_PUBLIC_KEY;

    if (!signature || !timestamp || !publicKey) return false;

    try {
        return nacl.sign.detached.verify(new TextEncoder().encode(timestamp + bodyText), hexToUint8Array(signature), hexToUint8Array(publicKey));
    } catch (error) {
        console.error("Verification error:", error);
        return false;
    }
}

export async function POST(req: NextRequest) {
    // 1. Ambil body berupa teks mentah untuk kebutuhan verifikasi keamanan
    const bodyText = await req.text();

    // 2. Validasi tanda tangan enkripsi dari Discord
    const isVerified = await verifyDiscordRequest(req, bodyText);
    if (!isVerified) {
        return new NextResponse("Invalid request signature", { status: 401 });
    }

    // 3. Parse teks menjadi JSON setelah lolos verifikasi
    const body = JSON.parse(bodyText);

    // 4. Tangani PING (Type 1) - Diperlukan Discord saat pertama kali mendaftarkan URL Webhook
    if (body.type === 1) {
        return NextResponse.json({ type: 1 });
    }

    // 5. Tangani Klik Tombol (Type 3)
    if (body.type === 3) {
        await connect();

        const customId = body.data.custom_id;
        const adminName = body.member?.user?.username || "Admin";
        let responseText = "";

        // ========================================================
        // KONDISI A: JIKA TOMBOL YANG DIKLIK ADALAH REPORT KOMENTAR
        // ========================================================
        if (customId.startsWith("admin_comment_")) {
            // Format customId: admin_comment_[action]_[commentId]
            // Contoh: admin_comment_delete_65f123456789...
            const parts = customId.split("_");
            const action = parts[2]; // "delete" atau "safe"
            const commentId = parts[3]; // ID MongoDB Komentar

            if (action === "delete") {
                const deletedComment = await CommentModel.findByIdAndDelete(commentId);
                if (!deletedComment) {
                    return NextResponse.json({
                        type: 4,
                        data: { content: `❌ Gagal: Komentar dengan ID ${commentId} sudah dihapus sebelumnya.` },
                    });
                }
                responseText = `🗑️ **[${adminName}]** telah **Menghapus Komentar** tersebut dari aplikasi.`;
            } else if (action === "safe") {
                responseText = `✅ **[${adminName}]** menyatakan komentar ini **Aman / Laporan Diabaikan**.`;
            }
        }

        // ========================================================
        // KONDISI B: JIKA TOMBOL YANG DIKLIK ADALAH REPORT POSTINGAN
        // ========================================================
        else if (customId.startsWith("admin_")) {
            // Format customId: admin_[action]_[postId]
            // Contoh: admin_nsfw_65f123456789...
            const parts = customId.split("_");
            const action = parts[1]; // "nsfw", "ai", "safe", atau "delete"
            const postId = parts[2]; // ID MongoDB Post

            const post = await PostModel.findById(postId);

            if (!post && action !== "delete") {
                return NextResponse.json({
                    type: 4,
                    data: { content: `❌ Gagal: Postingan dengan ID ${postId} sudah tidak ditemukan.` },
                });
            }

            if (action === "safe") {
                post.tags = post.tags.filter((t: string) => t.toLowerCase() !== "nsfw");
                post.adminVerified = { ...post.adminVerified, isSafeForced: true };
                await post.save();
                responseText = `✅ **[${adminName}]** menandai post ini **Aman / Bukan NSFW**.`;
            } else if (action === "nsfw") {
                if (!post.tags.includes("nsfw")) post.tags.push("nsfw");
                await post.save();
                responseText = `🔞 **[${adminName}]** mengubah tag post ini menjadi **NSFW**.`;
            } else if (action === "ai") {
                if (!post.tags.includes("ai")) post.tags.push("ai");
                await post.save();
                responseText = `🤖 **[${adminName}]** mengubah tag post ini menjadi **AI Art**.`;
            } else if (action === "delete") {
                const deletedPost = await PostModel.findByIdAndDelete(postId);
                if (!deletedPost) {
                    return NextResponse.json({
                        type: 4,
                        data: { content: `❌ Gagal: Postingan tersebut sudah terhapus.` },
                    });
                }
                responseText = `🗑️ **[${adminName}]** telah **Menghapus** postingan tersebut dari aplikasi.`;
            }
        }

        // 6. Kirim feedback balik ke Discord (Type 7: Mengedit pesan asal & menghapus barisan tombol)
        return NextResponse.json({
            type: 7,
            data: {
                content: responseText ? `${responseText}` : "Aksi berhasil diproses.",
                embeds: body.message.embeds, // Mempertahankan tampilan embed info laporan sebelumnya
                components: [], // Array kosong ini otomatis melenyapkan tombol agar tidak diklik 2 kali
            },
        });
    }

    return NextResponse.json({ error: "Unknown Interaction" }, { status: 400 });
}
