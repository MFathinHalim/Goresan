import { NextRequest, NextResponse } from "next/server";
import { connect } from "@/dbConfig/dbConfig";
import PostModel from "@/models/postModel";
import nacl from "tweetnacl";

// Fungsi helper untuk memverifikasi request asli dari Discord
// Fungsi helper untuk mengubah string hex menjadi Uint8Array secara manual
function hexToUint8Array(hexString: string): Uint8Array {
  const pairs = hexString.match(/[\da-f]{2}/gi) || [];
  return new Uint8Array(pairs.map(h => parseInt(h, 16)));
}

async function verifyDiscordRequest(request: NextRequest, bodyText: string) {
  const signature = request.headers.get("x-signature-ed25519");
  const timestamp = request.headers.get("x-signature-timestamp");
  const publicKey = process.env.DISCORD_PUBLIC_KEY;

  if (!signature || !timestamp || !publicKey) return false;

  try {
    return nacl.sign.detached.verify(
      new TextEncoder().encode(timestamp + bodyText),
      hexToUint8Array(signature), // Menggunakan fungsi konversi baru
      hexToUint8Array(publicKey)  // Menggunakan fungsi konversi baru
    );
  } catch (error) {
    console.error("Verification error:", error);
    return false;
  }
}
export async function POST(req: NextRequest) {
  // 1. Ambil body berupa teks mentah untuk kebutuhan verifikasi enkripsi
  const bodyText = await req.text();
  
  // 2. Validasi apakah request ini benar-benar datang dari Discord
  const isVerified = await verifyDiscordRequest(req, bodyText);
  if (!isVerified) {
    return new NextResponse("Invalid request signature", { status: 401 });
  }

  // 3. Parse teks menjadi JSON setelah lolos verifikasi
  const body = JSON.parse(bodyText);

  // 4. Tangani PING (Type 1) saat menekan tombol "Save Changes" di Discord Portal
  if (body.type === 1) {
    return NextResponse.json({ type: 1 });
  }

  // 5. Tangani Klik Tombol (Type 3)
  if (body.type === 3) {
    await connect();
    
    const customId = body.data.custom_id; // Contoh: "admin_nsfw_65f123..."
    const adminName = body.member?.user?.username || "Admin";

    const [_, action, postId] = customId.split("_");
    const post = await PostModel.findById(postId);

    if (!post && action !== "delete") {
      return NextResponse.json({
        type: 4,
        data: { content: `❌ Gagal: Postingan dengan ID ${postId} sudah dihapus atau tidak ditemukan.` }
      });
    }

    let responseText = "";

    if (action === "safe") {
      post.tags = post.tags.filter((t: string) => t.toLowerCase() !== "nsfw");
      post.adminVerified = { ...post.adminVerified, isSafeForced: true };
      await post.save();
      responseText = `✅ **[${adminName}]** menandai post ini **Aman / Bukan NSFW**.`;
    } 
    
    else if (action === "nsfw") {
      if (!post.tags.includes("nsfw")) post.tags.push("nsfw");
      await post.save();
      responseText = `🔞 **[${adminName}]** mengubah tag post ini menjadi **NSFW**.`;
    } 
    
    else if (action === "ai") {
      if (!post.tags.includes("ai")) post.tags.push("ai");
      await post.save();
      responseText = `🤖 **[${adminName}]** mengubah tag post ini menjadi **AI Art**.`;
    } 
    
    else if (action === "delete") {
      await PostModel.findByIdAndDelete(postId);
      responseText = `🗑️ **[${adminName}]** telah **Menghapus** postingan tersebut dari aplikasi.`;
    }

    return NextResponse.json({
      type: 7, // Edit pesan asal tempat tombol berada
      data: {
        content: `${responseText}`,
        embeds: body.message.embeds,
        components: [] // Menghilangkan tombol setelah diklik
      }
    });
  }

  return NextResponse.json({ error: "Unknown Interaction" }, { status: 400 });
}