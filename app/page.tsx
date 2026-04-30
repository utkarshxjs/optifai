"use client";
import { useState } from "react";

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadedUrl, setUploadedUrl] = useState("");

  const handleUpload = async () => {
    if (!file) return alert("Please select a file first!");
    
    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      
      const data = await response.json();
      
      if (data.url) {
        setUploadedUrl(data.url);
        alert("Success! Your image was saved to Vercel Blob.");
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
          Image <span className="text-[#39FF14]">Enhancer</span>
        </h1>
        
        <input 
          type="file" 
          onChange={(e) => setFile(e.target.files?.[0] || null)} 
          className="mb-4 block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[#39FF14] file:text-black hover:file:bg-[#32e011]"
        />

        <button 
          onClick={handleUpload}
          disabled={uploading}
          className="w-full bg-[#39FF14] text-black text-lg font-bold py-4 rounded-lg hover:bg-[#32e011] transition-all duration-300 disabled:opacity-50"
        >
          {uploading ? "Uploading to Database..." : "Test Upload"}
        </button>

        {uploadedUrl && (
          <div className="mt-8 p-4 bg-gray-900 rounded-lg text-sm break-all">
            <p className="text-[#39FF14] mb-2">Upload successful! Here is the public link:</p>
            <a href={uploadedUrl} target="_blank" rel="noreferrer" className="text-blue-400 hover:underline">
              {uploadedUrl}
            </a>
          </div>
        )}
        
      </div>
    </main>
  );
}
