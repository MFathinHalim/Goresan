import { HfInference } from "@huggingface/inference";

const hf = new HfInference(process.env.HF_TOKEN);

export async function detectNSFW(
  buffer: any,
  mimeType: string
): Promise<boolean> {
  const result = await hf.imageClassification({
    model: "Falconsai/nsfw_image_detection",
    data: new Blob([buffer], {
      type: mimeType,
    }),
  });

  const nsfw = result.find(
    (item) => item.label.toLowerCase() === "nsfw"
  );
  return (nsfw?.score ?? 0) > 0.004;
}