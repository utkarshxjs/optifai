import { NextResponse } from "next/server";
import { enhanceImage } from "@/lib/huggingface";

type EnhanceRequestBody = {
  imageUrl?: string;
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as EnhanceRequestBody;
    const imageUrl = body.imageUrl;

    if (!imageUrl || typeof imageUrl !== "string") {
      return NextResponse.json(
        { error: "Invalid request body. 'imageUrl' is required." },
        { status: 400 },
      );
    }

    const enhancedBlob = await enhanceImage(imageUrl);
    const arrayBuffer = await enhancedBlob.arrayBuffer();
    const base64Image = Buffer.from(arrayBuffer).toString("base64");

    return NextResponse.json(
      {
        imageBase64: base64Image,
        mimeType: enhancedBlob.type || "application/octet-stream",
      },
      { status: 200 },
    );
  } catch (error) {
    console.error("Failed to enhance image:", error);
    return NextResponse.json(
      { error: "Failed to enhance image." },
      { status: 500 },
    );
  }
}
