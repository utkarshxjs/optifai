import { NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";

export async function GET(request: Request) {
  try {
    // Grab the userId from the URL search parameters
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get("userId");

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 });
    }

    // Fetch all images for this specific user from Neon
    const images = await prisma.enhancedImage.findMany({
      where: {
        userId: userId,
      },
      orderBy: {
        createdAt: "desc", // Shows the newest uploads first
      },
    });

    return NextResponse.json({ images }, { status: 200 });
  } catch (error) {
    console.error("Failed to fetch gallery:", error);
    return NextResponse.json({ error: "Failed to fetch gallery" }, { status: 500 });
  }
}