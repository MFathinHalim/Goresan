import { NextRequest, NextResponse } from "next/server";
import { connect } from "@/dbConfig/dbConfig";
import { getDataFromToken } from "@/helpers/getDataFromToken";
import User from "@/models/userModel";
import Report from "@/models/reportModel";
import PostModel from "@/models/postModel";

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  await connect();
  try {
    const userId = getDataFromToken(req);
    const user = await User.findById(userId).select("username");
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { reason, customReason } = await req.json();
    if (!reason) return NextResponse.json({ error: "Alasan wajib diisi" }, { status: 400 });

    const post = await PostModel.findById(params.id).populate("user", "username");
    if (!post) return NextResponse.json({ error: "Post tidak ditemukan" }, { status: 404 });

    // Cek double report
    const alreadyReported = await Report.findOne({ reporterId: userId, postId: params.id });
    if (alreadyReported) {
      return NextResponse.json({ error: "Kamu sudah melaporkan postingan ini" }, { status: 400 });
    }

    // Simpan ke DB lokal
    const newReport = new Report({
      reporterId: userId,
      postId: params.id,
      reason,
      customReason: reason === "other" ? customReason : "",
    });
    await newReport.save();

    // KIRIM KE DISCORD MENGGUNAKAN BOT INTERACTION BUTTONS
    // Ganti DISCORD_CHANNEL_ID dengan ID channel tempat admin memantau
    const channelId = process.env.DISCORD_ADMIN_CHANNEL_ID; 
    
    const messageData = {
      content: `**Laporan Postingan!**`,
      embeds: [
        {
          title: post.title,
          description: `**Alasan Report:** ${reason}\n${customReason ? `**Detail:** ${customReason}` : ""}`,
          fields: [
            { name: "Kreator", value: post.user?.username || "Anonim", inline: true },
            { name: "Pelapor", value: user.username, inline: true },
            { name: "Post ID", value: post._id.toString(), inline: false }
          ],
          image: { url: post.img },
          color: 15158332 // Warna Merah
        }
      ],
      components: [
        {
          type: 1, // Action Row
          components: [
              { type: 2, label: "Mark NSFW", style: 2, custom_id: `admin_nsfw_${post._id}` },
              { type: 2, label: "Mark AI", style: 1, custom_id: `admin_ai_${post._id}` },
              { type: 2, label: "Mark Safe", style: 3, custom_id: `admin_safe_${post._id}` },
            { type: 2, label: "Delete Post", style: 4, custom_id: `admin_delete_${post._id}` }
          ]
        }
      ]
    };

    // Tembak ke API Discord untuk mengirim pesan bot
    await fetch(`https://discord.com/api/v10/channels/${channelId}/messages`, {
      method: "POST",
      headers: {
        Authorization: `Bot ${process.env.DISCORD_BOT_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(messageData),
    });

    return NextResponse.json({ message: "Laporan berhasil dikirim ke tim Moderator!" }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Gagal memproses laporan" }, { status: 500 });
  }
}