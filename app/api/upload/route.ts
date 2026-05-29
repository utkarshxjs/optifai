// app/api/upload/route.ts
import { NextResponse } from 'next/server';
import { put } from '@vercel/blob';
import { prisma } from '../../../lib/prisma';
import { enhanceImage } from '../../../lib/huggingface'; 

export async function POST(request: Request) {
  try {
    // 1. Extract file and user data
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const userId = formData.get('userId') as string;

    if (!file || !userId) {
      return NextResponse.json({ error: 'Missing file or user ID' }, { status: 400 });
    }

    // 2. Upload Original to Vercel Blob
   const originalBlob = await put(`original-${file.name}`, file, {
  access: 'public',
  addRandomSuffix: true, // <--- Add this line!
});

    // 3. Process with Hugging Face Engine
    const enhancedBuffer = await enhanceImage(originalBlob.url);

    // 4. Upload Enhanced Image to Vercel Blob
    const enhancedBlob = await put(`enhanced-${file.name}`, enhancedBuffer, {
      access: 'public',
      contentType: 'image/jpeg', // Assuming the model returns an image
    });

    // 5. Save both URLs to Neon Database via Prisma
    const dbRecord = await prisma.enhancedImage.create({
      data: {
        userId: userId,
        originalImageUrl: originalBlob.url,
        enhancedImageUrl: enhancedBlob.url,
      },
    });

    // 6. Return success to the frontend
    return NextResponse.json({ success: true, data: dbRecord });

  } catch (error) {
    console.error("Pipeline Error:", error);
    return NextResponse.json({ error: 'Failed to process image' }, { status: 500 });
  }
}