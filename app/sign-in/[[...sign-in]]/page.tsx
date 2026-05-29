"use client";
import { useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";

type GalleryImage = {
  id: string;
  originalImageUrl: string;
  enhancedImageUrl: string;
  createdAt: string;
};

export default function Home() {
  const { user } = useUser(); 
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [gallery, setGallery] = useState<GalleryImage[]>([]);

  const fetchGallery = async () => {
    if (!user) return;
    try {
      const response = await fetch(`/api/gallery?userId=${user.id}`);
      const data = await response.json();
      if (data.images) {
        setGallery(data.images);
      }
    } catch (error) {
      console.error("Failed to load gallery:", error);
    }
  };

  useEffect(() => {
    if (user) {
      fetchGallery();
    }
  }, [user]);

  const handleUpload = async () => {
    if (!file) return alert("Please select a file first!");
    if (!user) return alert("You must be logged in to upload!");
    
    setUploading(true);
    
    const formData = new FormData();
    formData.append("file", file);
    formData.append("userId", user.id); 

    try {
      const response = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      
      const data = await response.json();
      
      if (response.ok) {
        alert("Success! Your image has been processed.");
        fetchGallery(); 
      } else {
        alert(`Error: ${data.error}`);
      }
    } catch (error) {
      console.error(error);
      alert("Upload failed");
    } finally {
      setUploading(false);
      setFile(null);
    }
  };

  return (
    <main className="min-h-screen bg-[#0a0a0a] flex flex-col items-center p-6 font-sans text-white">
      
      {/* Upload Zone */}
      <div className="max-w-2xl w-full text-center space-y-8 mt-16">
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
      </div>

      {/* OPTION 2: THE MASONRY LAYOUT */}
      {user && (
        <div className="max-w-6xl w-full mt-24">
          <div className="flex items-center justify-between mb-8 border-b border-gray-900 pb-4">
            <h2 className="text-xl font-medium tracking-wide uppercase text-gray-400">
              Saved Masterpieces
            </h2>
            <span className="text-xs bg-gray-900 border border-gray-800 text-[#39FF14] px-3 py-1 rounded-full">
              Layout 2: Masonry
            </span>
          </div>
          
          {gallery.length === 0 ? (
            <p className="text-gray-600 text-center py-16 text-sm tracking-wide">
              No history found. Try uploading an image above.
            </p>
          ) : (
            /* We swapped CSS Grid for CSS Columns to create the interlocking effect */
            <div className="columns-1 sm:columns-2 md:columns-3 lg:columns-4 gap-6 space-y-6">
              {gallery.map((img) => (
                <div 
                  key={img.id} 
                  /* break-inside-avoid prevents images from splitting across columns */
                  className="group relative bg-gray-900 rounded-xl overflow-hidden border border-gray-800 hover:border-[#39FF14] transition-all duration-300 shadow-md hover:shadow-[#39ff14]/10 break-inside-avoid"
                >
                  {/* Removed aspect-square so images keep their natural shape */}
                  <img 
                    src={img.enhancedImageUrl} 
                    alt="Processed" 
                    className="w-full h-auto transition-transform duration-500 group-hover:scale-105"
                  />
                  
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                    <a 
                      href={img.enhancedImageUrl} 
                      target="_blank" 
                      rel="noreferrer" 
                      className="text-xs font-semibold text-[#39FF14] bg-black/40 backdrop-blur-md px-3 py-2 rounded-lg border border-[#39FF14]/30 hover:bg-[#39FF14] hover:text-black transition-all duration-200"
                    >
                      View Original ↗
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </main>
  );
}