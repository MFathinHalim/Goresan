import { HfInference } from "@huggingface/inference";

const hf = new HfInference(process.env.HF_TOKEN);

export async function detectAIImage(
  buffer: any,
  mimeType: string
): Promise<boolean> {
  try {
    const result = await hf.imageClassification({
      model: "umm-maybe/AI-image-detector",
      data: new Blob([buffer], {
        type: mimeType,
      }),
    });

    // Model ini biasanya mengembalikan label seperti "ai" dan "human" atau "fake" dan "real"
    // Kita cari label yang mengandung kata 'ai' atau 'fake'
    const aiPrediction = result.find(
      (item) => 
        item.label.toLowerCase() === "ai" || 
        item.label.toLowerCase() === "fake" ||
        item.label.toLowerCase() === "artificial"
    );

    console.log("Hasil Prediksi AI Image:", result);

    // Umumnya threshold 0.5 atau 0.6 sudah cukup akurat untuk model ini
    return (aiPrediction?.score ?? 0) > 0.6;
  } catch (error) {
    console.error("Gagal mendeteksi AI Image:", error);
    // Kembalikan false sebagai fallback jika API bermasalah agar tidak memblokir upload
    return false; 
  }
}