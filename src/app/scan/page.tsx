'use client';

import { useEffect, useRef, useState } from 'react';
import QrScanner from 'qr-scanner';
import QRCode from '@/components/qr-code';

import PageProtected from '@/components/authentication';
import TopNavbar from "@/components/top-navbar";
import BottomNavbar from '@/components/bottom-navbar';

import { auth, db } from '@/app/firebaseConfig';
import { onAuthStateChanged } from 'firebase/auth';
import { addDoc, collection, doc, getDoc, getDocs, setDoc } from 'firebase/firestore';

async function processMeetUp(code: string): Promise<[boolean, string, number?, boolean?]> {
  const [friendId, timestamp, friendLat, friendLon] = code.split(',');

  if (Date.now() - parseInt(timestamp) > 10000) {
    return [false, "QR code expired"];
  }

  if (!navigator.geolocation) {
    return [false, "Geolocation not supported"];
  }

  try {
    const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
      navigator.geolocation.getCurrentPosition(resolve, reject);
    });

    const userLat = pos.coords.latitude;
    const userLon = pos.coords.longitude;
    const distance = Math.sqrt(
      Math.pow(userLat - parseFloat(friendLat), 2) +
      Math.pow(userLon - parseFloat(friendLon), 2)
    );

    if (isNaN(distance)) {
      return [false, "Invalid QR location data"];
    }

    if (distance < 0.0009) {
      const userUid = (window as any).__currentUserUid || '';
      const friendDocRef = doc(db, "users", userUid, "friends", friendId);
      const friendDoc = await getDoc(friendDocRef);

      if (!friendDoc.exists()) return [false, "Friend not found"];

      const friendData = friendDoc.data() as { connectionId: string };
      const connectionId = friendData.connectionId;

      const meetupsCollectionRef = collection(db, "connections", connectionId, "meetups");

      const meetupsSnapshot = await getDocs(meetupsCollectionRef);
      let lastMeetup: any = null;
      meetupsSnapshot.forEach(doc => {
        const data = doc.data();
        if (!lastMeetup || data.timestamp > lastMeetup.timestamp) {
          lastMeetup = data;
        }
      });

      let streak = 1;
      let streakIncreased = false;

      if (lastMeetup) {
        const lastDate = new Date(lastMeetup.timestamp);
        const now = new Date();
        const yesterday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
        const lastDateDay = new Date(lastDate.getFullYear(), lastDate.getMonth(), lastDate.getDate());

        if (lastDateDay.getTime() !== yesterday.getTime()) {
          const connectionRef = doc(db, "connections", connectionId);
          await setDoc(connectionRef, { streak: 1, streak_expire: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 2) }, { merge: true });
        } else {
          const connectionRef = doc(db, "connections", connectionId);
          const connectionSnap = await getDoc(connectionRef);
          streak = 2;
          if (connectionSnap.exists()) {
            const data = connectionSnap.data();
            if (typeof data.streak === "number") {
              streak = data.streak + 1;
              streakIncreased = true;

              // Update points for both users
              const userRef = doc(db, "users", userUid);
              const friendRef = doc(db, "users", friendId);

              await setDoc(userRef, { points: (friendDoc.data()?.points || 0) + 1 }, { merge: true });
              const friendSnap = await getDoc(friendRef);
              await setDoc(friendRef, { points: (friendSnap.data()?.points || 0) + 1 }, { merge: true });
            }
          }
          await setDoc(connectionRef, { streak, streak_expire: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 2) }, { merge: true });
        }
      }

      const newMeetup = {
        timestamp: Date.now(),
        lat: userLat,
        lon: userLon,
      };

      await addDoc(meetupsCollectionRef, newMeetup);

      return [true, "Success", streak, streakIncreased];
    } else {
      return [false, "Too far away from friend"];
    }
  } catch (err) {
    return [false, "Geolocation permission denied"];
  }
}

function QrScannerComponent() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [scannedData, setScannedData] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [frozen, setFrozen] = useState(false);
  const [processMeetUpSuccess, setProcessMeetUpSuccess] = useState<[boolean, string, number?, boolean?] | null>(null);
  const scannerRef = useRef<QrScanner | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const hasScanned = useRef(false);


  useEffect(() => {
    const startScanner = async () => {
      try {
        streamRef.current = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });

        if (videoRef.current && streamRef.current) {
          videoRef.current.srcObject = streamRef.current;

          scannerRef.current = new QrScanner(
            videoRef.current,
            (result) => {
              if (!hasScanned.current) {
                hasScanned.current = true;
                setScannedData(result.data);
                processMeetUp(result.data).then(setProcessMeetUpSuccess);
                scannerRef.current?.stop();
                streamRef.current?.getTracks().forEach(track => track.stop());
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

        {scannedData && !processMeetUpSuccess && (
          <div className="bg-green-600 bg-opacity-80 p-4 rounded text-white text-lg">
            ✅ Scanned: <strong>Loading</strong>
          </div>
        )}

        {(processMeetUpSuccess && processMeetUpSuccess[0] == true) && (
          <div className="bg-blue-600 bg-opacity-80 p-4 rounded text-white text-lg mt-4">
            🎉 Meetup confirmed! Streak: {processMeetUpSuccess[2]}
            {processMeetUpSuccess[3] ? ' (Streak increased! Maybe add a cool animation or whatnot similar to duolingo)' : ' (Streak not increased)'}
          </div>
        )}

        {(processMeetUpSuccess && processMeetUpSuccess[0] === false) && (
          <div className="bg-yellow-600 bg-opacity-80 p-4 rounded text-white text-lg mt-4">
            ❌ Meetup failed. Please try again. {processMeetUpSuccess[1]}
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
  const [showPermissionPopup, setShowPermissionPopup] = useState(() => {
    if (typeof navigator === "undefined") return true;
    // Check camera permission
    const cameraPromise = navigator.permissions?.query({ name: "camera" as PermissionName }).then(res => res.state === "granted");
    // Check geolocation permission
    const geoPromise = navigator.permissions?.query({ name: "geolocation" as PermissionName }).then(res => res.state === "granted");
    // If permissions API is not available, show popup by default
    if (!cameraPromise || !geoPromise) return true;
    // This is a sync initializer, so we can't await. Assume not granted, will update in useEffect.
    return true;
  });

  useEffect(() => {
    let cancelled = false;
    async function checkPermissions() {
      if (typeof navigator === "undefined" || !navigator.permissions) return;
      try {
        const [camera, geo] = await Promise.all([
          navigator.permissions.query({ name: "camera" as PermissionName }),
          navigator.permissions.query({ name: "geolocation" as PermissionName }),
        ]);
        if (!cancelled) {
          setShowPermissionPopup(!(camera.state === "granted" && geo.state === "granted"));
        }
      } catch {
        if (!cancelled) setShowPermissionPopup(true);
      }
    }
    checkPermissions();
    return () => { cancelled = true; };
  }, []);
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
              pos => resolve(`${pos.coords.latitude},${pos.coords.longitude}`),
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
            {showPermissionPopup && (
            <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black bg-opacity-90">
              <div className="bg-white rounded-lg shadow-lg p-8 max-w-sm w-full flex flex-col items-center">
                <h2 className="text-xl font-bold mb-4 text-center">Permissions Required</h2>
                <p className="mb-4 text-gray-700 text-center">
                  This app needs access to your <b>camera</b> to scan your friend's QR code, and your <b>location</b> to verify you are together for a meetup.
                </p>
                <button
                  className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2 rounded transition"
                  onClick={() => setShowPermissionPopup(false)}
                >
                  Next
                </button>
              </div>
            </div>
            )}
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
