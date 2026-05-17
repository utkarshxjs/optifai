// lib/huggingface.ts

export async function enhanceImage(imageUrl: string): Promise<Buffer> {
  // 1. Fetch the physical image from your Vercel Blob URL
  const response = await fetch(imageUrl);
  if (!response.ok) {
    throw new Error('Failed to fetch the original image from Vercel Blob');
  }
  const imageArrayBuffer = await response.arrayBuffer();
  const imageBuffer = Buffer.from(imageArrayBuffer);

  // 2. Define the Hugging Face Model Endpoint
  // Swapped to a standard Image-to-Image model, but free tiers are finicky!
  const HF_API_URL = "https://api-inference.huggingface.co/models/timbrooks/instruct-pix2pix"; 
  
  try {
    // 3. Send the image to Hugging Face
    const hfResponse = await fetch(HF_API_URL, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
        "Content-Type": "application/octet-stream",
      },
      body: imageBuffer,
    });

    if (!hfResponse.ok) {
      const errorText = await hfResponse.text();
      console.warn("⚠️ Hugging Face API is offline or rejected the model:", hfResponse.status);
      console.warn("Details:", errorText.substring(0, 100));
      
      // THE FIX: If the AI is down, gracefully return the original image
      // so the database and frontend don't crash.
      console.log("🔄 Bypassing AI: Returning original image instead.");
      return imageBuffer;
    }

    // 4. Return the new enhanced image data if successful
    const enhancedArrayBuffer = await hfResponse.arrayBuffer();
    return Buffer.from(enhancedArrayBuffer);

  } catch (error) {
    console.error("Pipeline Error inside Hugging Face call:", error);
    // Ultimate fallback: return original image
    return imageBuffer;
  }
}