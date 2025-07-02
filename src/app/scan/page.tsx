'use client';

import { useEffect, useRef, useState } from 'react';
import QrScanner from 'qr-scanner';
import QRCode from '@/components/qr-code';

import PageProtected from '@/components/authentication';
import TopNavbar from "@/components/top-navbar";
import BottomNavbar from '@/components/bottom-navbar';

function processMeetUp(code: string): boolean {
  const friendId = code.split(',')[0];
  const timestamp = code.split(',')[1];
  const geo = code.split(',')[2];
  const [lat, lon] = geo.split(':');

  if (Date.now() - parseInt(timestamp) > 10000) {
    return false;
  } else if (navigator.geolocation) {
    let isNearby = false;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const toRad = (value: number) => (value * Math.PI) / 180;
        const R = 6371000; // meters
        const dLat = toRad(parseFloat(lat) - pos.coords.latitude);
        const dLon = toRad(parseFloat(lon) - pos.coords.longitude);
        const a =
          Math.sin(dLat / 2) * Math.sin(dLat / 2) +
          Math.cos(toRad(pos.coords.latitude)) *
            Math.cos(toRad(parseFloat(lat))) *
            Math.sin(dLon / 2) *
            Math.sin(dLon / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        const distance = R * c;
        if (distance <= 100) {
          isNearby = true;
        }
      },
      () => {
        isNearby = false;
      }
    );
    return isNearby;
  }

  return true;
}

function QrScannerComponent() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [scannedData, setScannedData] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [frozen, setFrozen] = useState(false);
  const [processMeetUpSuccess, setProcessMeetUpSuccess] = useState<boolean>(false);
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
                setProcessMeetUpSuccess(processMeetUp(result.data))
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
      scannerRef.current?.stop();

      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }

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

    return () => {
      scannerRef.current?.stop();
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, [scannedData]);

  return (
    <div className="relative w-screen h-[calc(100vh-4rem)] overflow-hidden bg-black">
      <video
        ref={videoRef}
        className={`absolute top-0 left-0 w-full h-full object-cover ${frozen ? 'hidden' : ''}`}
        autoPlay
        muted
        playsInline
      />

      <canvas
        ref={canvasRef}
        className={`absolute top-0 left-0 w-full h-full object-cover ${frozen ? '' : 'hidden'}`}
      />

      <div className="absolute inset-0 flex flex-col items-center justify-center text-white p-4">
        {!scannedData && (
          <h1 className="text-3xl font-bold mb-4">Scan a friend's QR Code</h1>
        )}

        {scannedData && (
          <div className="bg-green-600 bg-opacity-80 p-4 rounded text-white text-lg">
            ✅ Scanned: <strong>{scannedData}</strong>
          </div>
        )}

        {processMeetUpSuccess && (
          <div className="bg-blue-600 bg-opacity-80 p-4 rounded text-white text-lg mt-4">
            🎉 Meetup confirmed! Streak: ___
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
  const [qrSize, setQrSize] = useState<number | null>(null);
  const [qrText, setQrText] = useState<string>('');

  useEffect(() => {
    const updateSize = () => {
      setQrSize(Math.min(window.innerWidth * 0.75, window.innerHeight * 0.75));
    };

    updateSize();
    window.addEventListener('resize', updateSize);

    return () => window.removeEventListener('resize', updateSize);
  }, []);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    let isMounted = true;

    const updateQrText = async () => {
      let geo = 'unknown,unknown';
      if (navigator.geolocation) {
        try {
          geo = await new Promise<string>((resolve) => {
            navigator.geolocation.getCurrentPosition(
              pos => resolve(`${pos.coords.latitude}:${pos.coords.longitude}`),
              () => resolve('unknown,unknown'),
              { timeout: 5000 }
            );
          });
        } catch {
          geo = 'unknown,unknown';
        }
      }
      if (isMounted && typeof window !== 'undefined') {
        const userUid = (window as any).__currentUserUid || ''; // fallback if user is not available
        setQrText(`${userUid},${Date.now()},${geo}`);
      }
    };

    // This effect expects user.uid to be available in the closure.
    // We'll set it in the render function below.
    setTimeout(updateQrText, 250);
    interval = setInterval(updateQrText, 2500);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  return (
    <PageProtected>
      {(user) => {
        // Set user.uid globally for the QR text updater effect
        if (typeof window !== 'undefined') {
          (window as any).__currentUserUid = user.uid;
        }

        return (
          <>
            <TopNavbar />
            <div className="relative w-full h-[calc(100vh-4rem)] overflow-hidden">
              <QrScannerComponent />

              {expanded && qrSize !== null ? (
                <div
                  className="fixed inset-0 z-40 flex flex-col items-center justify-center bg-black bg-opacity-80 cursor-pointer"
                  onClick={() => setExpanded(false)}
                >
                  <span className="mb-2 text-white font-semibold">Your QR code</span>
                  <div className="bg-white p-4 rounded shadow flex flex-col items-center">
                    <QRCode
                      text={qrText || '0'}
                      width={qrSize}
                    />
                  </div>
                </div>
              ) : (
                <div
                  className="absolute bottom-5 left-1/2 transform -translate-x-1/2 z-20 cursor-pointer flex flex-col items-center"
                  onClick={() => setExpanded(true)}
                >
                  <span className="mb-1 text-white font-semibold drop-shadow-md">Your QR code</span>
                  <div className="bg-white bg-opacity-80 p-2 rounded shadow">
                    <QRCode text={qrText || '0'} width={100} />
                  </div>
                </div>
              )}
            </div>

            <BottomNavbar />
          </>
        );
      }}
    </PageProtected>
  );
}
