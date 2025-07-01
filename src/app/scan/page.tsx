'use client';

import { useEffect, useRef, useState } from 'react';
import QrScanner from 'qr-scanner';
import QRCode from '@/components/qr-code';

import PageProtected from '@/components/authentication';
import TopNavbar from "@/components/top-navbar";
import BottomNavbar from '@/components/bottom-navbar';

function QrScannerComponent() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [scannedData, setScannedData] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [frozen, setFrozen] = useState(false);
  const scannerRef = useRef<QrScanner | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  useEffect(() => {
    const startScanner = async () => {
      try {
        streamRef.current = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });

        if (videoRef.current && streamRef.current) {
          videoRef.current.srcObject = streamRef.current;

          scannerRef.current = new QrScanner(
            videoRef.current,
            (result) => {
              if (!scannedData) {
                setScannedData(result.data);
                freezeFrame();
              }
            },
            {
              highlightScanRegion: false,
              highlightCodeOutline: true,
            }
          );

          scannerRef.current.start();
        }
      } catch (err: any) {
        setError("Camera access denied: " + err.message);
      }
    };

    const freezeFrame = () => {
      // Stop scanner and camera
      scannerRef.current?.stop();

      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }

      // Draw current video frame to canvas
      if (videoRef.current && canvasRef.current) {
        const video = videoRef.current;
        const canvas = canvasRef.current;
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          setFrozen(true);
        }
      }
    };

    startScanner();

    // Cleanup on unmount
    return () => {
      scannerRef.current?.stop();
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, [scannedData]);

  return (
    <div className="relative w-screen h-[calc(100vh-4rem)] overflow-hidden bg-black">
      {/* Video is hidden once frozen */}
      <video
        ref={videoRef}
        className={`absolute top-0 left-0 w-full h-full object-cover ${frozen ? 'hidden' : ''}`}
        autoPlay
        muted
        playsInline
      />

      {/* Canvas to show frozen frame */}
      <canvas
        ref={canvasRef}
        className={`absolute top-0 left-0 w-full h-full object-cover ${frozen ? '' : 'hidden'}`}
      />

      {/* Overlay content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-4">
        <h1 className="text-3xl font-bold mb-4">Scan a friend's QR Code</h1>

        {scannedData && (
          <div className="bg-green-600 bg-opacity-80 p-4 rounded text-white text-lg">
            ✅ Scanned: <strong>{scannedData}</strong>
          </div>
        )}

        {error && (
          <div className="bg-red-600 bg-opacity-80 p-4 rounded text-white text-lg mt-4">
            ⚠️ Error: {error}
          </div>
        )}
      </div>
    </div>
  );
}

export default function QrScanPage() {
  const [expanded, setExpanded] = useState(false);
  const [qrSize, setQrSize] = useState<number | null>(null); // use null initially

  useEffect(() => {
    const updateSize = () => {
      console.log('Updating QR size based on window width:', window.innerWidth);
      setQrSize(Math.min(window.innerWidth * 0.75, window.innerHeight * 0.75));
    };

    updateSize();
    window.addEventListener('resize', updateSize);

    return () => window.removeEventListener('resize', updateSize);
  }, []);

  return (
    <PageProtected>
      {(user) => (
        <>
          <TopNavbar />
          <div className="relative w-full h-[calc(100vh-4rem)] overflow-hidden">
            <QrScannerComponent />

            {expanded && qrSize !== null ? (
              <div
                className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black bg-opacity-80 cursor-pointer"
                onClick={() => setExpanded(false)}
              >
                <span className="mb-2 text-white font-semibold">Your QR code</span>
                <div className="bg-white p-4 rounded shadow flex flex-col items-center">
                  <QRCode text={user.uid} width={qrSize} />
                </div>
              </div>
            ) : (
              <div
                className="absolute bottom-20 left-1/2 transform -translate-x-1/2 z-20 cursor-pointer flex flex-col items-center"
                onClick={() => setExpanded(true)}
              >
                <span className="mb-1 text-white font-semibold drop-shadow-md">Your QR code</span>
                <div className="bg-white bg-opacity-80 p-2 rounded shadow">
                  <QRCode text={user.uid} width={100} />
                </div>
              </div>
            )}
          </div>

          <BottomNavbar />
        </>
      )}
    </PageProtected>
  );
}
