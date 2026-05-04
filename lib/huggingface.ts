import { HfInference } from "@huggingface/inference";

const apiKey = process.env.HUGGINGFACE_API_KEY;

if (!apiKey) {
  throw new Error("HUGGINGFACE_API_KEY is not set in environment variables.");
}

const hf = new HfInference(apiKey);

const IMAGE_ENHANCEMENT_MODEL = "stabilityai/stable-diffusion-xl-refiner-1.0";

export async function enhanceImage(imageUrl: string): Promise<Blob> {
  const response = await fetch(imageUrl);
  if (!response.ok) {
    throw new Error(`Failed to fetch image from URL: ${imageUrl}`);
  }

  const sourceImage = await response.blob();

  const image = await hf.imageToImage({
    model: IMAGE_ENHANCEMENT_MODEL,
    inputs: sourceImage,
    parameters: {
      prompt: "enhance quality, sharpen details, improve lighting",
    },
  });

  return image;
}
