import User from "@/models/userModel";

export async function trackInteraction(userId: string, tags: string[], weight: number) {
  if (!userId || !tags || tags.length === 0) return;

  for (const tag of tags) {
    const cleanTag = tag.toLowerCase();
    
    // Cari apakah tag sudah ada di array interactions milik user
    await User.updateOne(
      { _id: userId, "interactions.tag": cleanTag },
      { $inc: { "interactions.$.score": weight } }
    );

    // Jika tag belum pernah ada, push objek baru ke array
    await User.updateOne(
      { _id: userId, "interactions.tag": { $ne: cleanTag } },
      { $push: { interactions: { tag: cleanTag, score: weight } } }
    );
  }
}