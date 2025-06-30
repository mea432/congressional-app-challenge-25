'use client';

import { useEffect, useRef, useState } from 'react';
import QrScanner from 'qr-scanner'; // install with: npm install qr-scanner

export default function QrScanPage() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [scannedData, setScannedData] = useState<string>('');
  const [error, setError] = useState<string>('');

  useEffect(() => {
    let scanner: QrScanner | null = null;
    let stream: MediaStream | null = null;

    const startScanner = async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });

        if (videoRef.current) {
          videoRef.current.srcObject = stream;

          scanner = new QrScanner(
            videoRef.current,
            (result) => {
              setScannedData(result.data);
              scanner?.stop();
              stream?.getTracks().forEach((track) => track.stop());
            },
            {
              highlightScanRegion: true,
              highlightCodeOutline: true,
            }
          );

          scanner.start();
        }
      } catch (err: any) {
        setError("Camera access denied: " + err.message);
      }
    };

    startScanner();

    return () => {
      scanner?.stop();
      stream?.getTracks().forEach((track) => track.stop());
    };
  }, []);

  return (
    <div className="p-4 space-y-4">
      <h1 className="text-2xl font-bold">Scan QR Code</h1>

      <video
        ref={videoRef}
        className="w-full max-w-md border rounded"
        autoPlay
        muted
        playsInline
      />

      {scannedData && (
        <div className="bg-green-100 p-2 rounded text-green-800">
          ✅ Scanned: <strong>{scannedData}</strong>
        </div>
      )}

      {error && (
        <div className="bg-red-100 p-2 rounded text-red-800">
          ⚠️ Error: {error}
        </div>
      )}
    </div>
  );
}
