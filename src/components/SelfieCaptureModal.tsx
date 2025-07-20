"use client";
import { useEffect, useRef, useState } from "react";

type Props = {
  onClose: () => void;
  onUpload: (imageUrl: string, caption: string) => void;
};

export default function SelfieCaptureModal({ onClose, onUpload }: Props) {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [caption, setCaption] = useState("");
  const [imageBlob, setImageBlob] = useState<Blob | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "user" },
        });
        if (videoRef.current) videoRef.current.srcObject = stream;
      } catch (err) {
        alert("Unable to access front camera");
        onClose();
      }
    };
    startCamera();

    return () => {
      if (videoRef.current?.srcObject) {
        const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
        tracks.forEach((track) => track.stop());
      }
    };
  }, []);

  const capturePhoto = () => {
    if (!videoRef.current || !canvasRef.current) return;

    const ctx = canvasRef.current.getContext("2d");
    if (!ctx) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob((blob) => {
      if (blob) {
        setImageBlob(blob);
        setPreviewUrl(URL.createObjectURL(blob));
      }
    }, "image/jpeg");
  };

  const upload = async () => {
    if (!imageBlob) return;
    setUploading(true);

    const formData = new FormData();
    formData.append("image", imageBlob);
    formData.append("key", "e42686b6e29d3a7a92bab30aca542c96");

    try {
      const res = await fetch("https://api.imgbb.com/1/upload", {
        method: "POST",
        body: formData,
      });
      const data = await res.json();
      const imageUrl = data?.data?.url;
      if (imageUrl) {
        onUpload(imageUrl, caption.trim() ? caption : "No caption");
        onClose();
      } else {
        alert("Upload failed");
      }
    } catch (err) {
      alert("Error uploading image");
      setUploading(false);
      console.error("Upload error:", err);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="bg-white rounded-lg p-4 max-w-sm w-full relative">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 cursor-pointer"
        >
          ✖
        </button>
        <h2 className="text-xl font-bold mb-2 text-center">Take a Selfie</h2>

        {!previewUrl ? (
          <>
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full rounded"
            />
            <button
              onClick={capturePhoto}
              className="mt-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded w-full cursor-pointer"
            >
              Capture
            </button>
          </>
        ) : (
          <>
            <img
              src={previewUrl}
              alt="Preview"
              className="w-full rounded mb-2"
            />
            <textarea
              placeholder="Optional caption..."
              className="w-full border border-gray-300 rounded p-2 mb-2 resize-none text-black"
              rows={2}
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
            />
            <button
              onClick={upload}
              disabled={uploading}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded w-full cursor-pointer"
            >
              {uploading ? "Uploading..." : "Upload"}
            </button>
          </>
        )}
      </div>
      <canvas ref={canvasRef} style={{ display: "none" }} />
    </div>
  );
}
