import { NextResponse } from "next/server";
import { auth } from "@clerk/nextjs/server";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import { enhanceImage } from "@/lib/huggingface";

type OptifAIequestBody = {
  imageUrl?: string;
};

const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
});

const ratelimit = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(3, "1 m"),
});

export async function POST(request: Request) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const { success } = await ratelimit.limit(userId);

    if (!success) {
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        { status: 429 },
      );
    }

    const body = (await request.json()) as OptifAIequestBody;
    const imageUrl = body.imageUrl;

    if (!imageUrl || typeof imageUrl !== "string") {
      return NextResponse.json(
        { error: "Invalid request body. 'imageUrl' is required." },
        { status: 400 },
      );
    }

    const enhancedBuffer = await enhanceImage(imageUrl);
const base64Image = enhancedBuffer.toString("base64");

   return NextResponse.json(
   {
     imageBase64: base64Image,
     mimeType: "image/jpeg", 
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
