import { NextRequest, NextResponse } from "next/server";
import { connect } from "@/dbConfig/dbConfig";
import { getDataFromToken } from "@/helpers/getDataFromToken";
import User from "@/models/userModel";
// Pastikan sesuaikan dengan nama file & model komentar di aplikasi kamu
import CommentModel from "@/models/commentModel";

export async function POST(req: NextRequest, { params }: { params: { postId: string } }) {
    await connect();
    try {
        // 1. Validasi Pelapor
        const userId = getDataFromToken(req);
        const user = await User.findById(userId).select("username");
        if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

        // 2. Ambil alasan dari request body
        const { reason, customReason } = await req.json();
        if (!reason) return NextResponse.json({ error: "Alasan wajib diisi" }, { status: 400 });

        // 3. Cari komentar yang dilaporkan & populate pembuat komentarnya
        const comment = await CommentModel.findById(params.postId).populate("user", "username");
        if (!comment) return NextResponse.json({ error: "Komentar tidak ditemukan" }, { status: 404 });

        const channelId = process.env.DISCORD_ADMIN_CHANNEL_ID;

        // 4. Struktur data pesan untuk Discord (Khusus Komentar)
        const messageData = {
            content: `⚠️ **Laporan Komentar Baru!**`,
            embeds: [
                {
                    title: `Isi Komentar:`,
                    description: `"${comment.content}"\n\n**Alasan Report:** ${reason}\n${customReason ? `**Detail:** ${customReason}` : ""}`,
                    fields: [
                        { name: "Penulis Komentar", value: comment.user?.username || "Anonim", inline: true },
                        { name: "Pelapor", value: user.username, inline: true },
                        { name: "Comment ID", value: comment._id.toString(), inline: false },
                        { name: "Post ID Asal", value: comment.post?.toString() || "Tidak Tersedia", inline: false },
                    ],
                    color: 16753920, // Warna Oranye/Kuning Tua untuk membedakan dengan Report Post (Merah)
                },
            ],
            components: [
                {
                    type: 1, // Action Row
                    components: [
                        // Menggunakan prefix "admin_comment_..." agar tidak tertukar di endpoint webhook
                        { type: 2, label: "Keep Safe", style: 3, custom_id: `admin_comment_safe_${comment._id}` },
                        { type: 2, label: "Delete Comment", style: 4, custom_id: `admin_comment_delete_${comment._id}` },
                    ],
                },
            ],
        };

        // 5. Kirim langsung ke Discord API via Bot Token
        await fetch(`https://discord.com/api/v10/channels/${channelId}/messages`, {
            method: "POST",
            headers: {
                Authorization: `Bot ${process.env.DISCORD_BOT_TOKEN}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify(messageData),
        });

        return NextResponse.json({ message: "Laporan komentar berhasil dikirim ke Moderator!" }, { status: 201 });
    } catch (error) {
        console.error(error);
        return NextResponse.json({ error: "Gagal memproses laporan komentar" }, { status: 500 });
    }
}
