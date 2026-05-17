"use client";
import { useState } from "react";
import { useUser } from "@clerk/nextjs"; // 1. Import the Clerk hook

export default function Home() {
  const { user } = useUser(); // 2. Get the active user
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadedUrl, setUploadedUrl] = useState("");

  const handleUpload = async () => {
    // 3. Safety check: must have a file AND a logged-in user
    if (!file) return alert("Please select a file first!");
    if (!user) return alert("You must be logged in to upload!");
    
    setUploading(true);
    
    const formData = new FormData();
    formData.append("file", file);
    formData.append("userId", user.id); // 4. Attach the Clerk User ID

    try {
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      
      const data = await response.json();
      
      // Note: Backend returns 'data.data.enhancedImageUrl' based on your route
      if (response.ok) {
        setUploadedUrl(data.data.enhancedImageUrl);
        alert("Success! Your AI-enhanced image is ready.");
      } else {
        alert(`Error: ${data.error}`);
      }
    } catch (error) {
      console.error(error);
      alert("Upload failed");
    } finally {
      setUploading(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center p-6 font-sans text-white">
      <div className="max-w-2xl w-full text-center space-y-8">
        
        <h1 className="text-5xl font-bold tracking-tight">
          Image <span className="text-[#39FF14]">OptifAI</span>
        </h1>
        
        <input 
          type="file" 
          accept="image/*"
          onChange={(e) => setFile(e.target.files?.[0] || null)} 
          className="mb-4 block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[#39FF14] file:text-black hover:file:bg-[#32e011]"
        />

        <button 
          onClick={handleUpload}
          disabled={uploading || !user}
          className="w-full bg-[#39FF14] text-black text-lg font-bold py-4 rounded-lg hover:bg-[#32e011] transition-all duration-300 disabled:opacity-50"
        >
          {!user ? "Please Sign In First" : uploading ? "AI is Processing..." : "Enhance Image"}
        </button>

        {uploadedUrl && (
          <div className="mt-8 p-4 bg-gray-900 rounded-lg text-sm break-all">
            <p className="text-[#39FF14] mb-2">Success! Here is your enhanced image:</p>
            <a href={uploadedUrl} target="_blank" rel="noreferrer" className="text-blue-400 hover:underline">
              {uploadedUrl}
            </a>
            {/* Show a small preview if you want */}
            <img src={uploadedUrl} alt="Enhanced" className="mt-4 rounded-lg border border-gray-700 max-h-64 mx-auto" />
          </div>
        )}
        
      </div>
    </main>
  );
}