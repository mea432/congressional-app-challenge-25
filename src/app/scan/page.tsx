'use client';

// imgbb api key: e42686b6e29d3a7a92bab30aca542c96
import { useEffect, useRef, useState } from 'react';
import QrScanner from 'qr-scanner';
import QRCode from '@/components/qr-code';

import PageProtected from '@/components/authentication';
import TopNavbar from "@/components/top-navbar";
import BottomNavbar from '@/components/bottom-navbar';
import SelfieCaptureModal from '@/components/SelfieCaptureModal';

import { db } from '@/app/firebaseConfig';
import { addDoc, collection, doc, getDoc, getDocs, setDoc } from 'firebase/firestore';
import Link from 'next/dist/client/link';
import { Button } from '@/components/ui/button';
import StreakAnimation from '@/components/streak-animation';
import Image from 'next/image';

async function processMeetUp(code: string): Promise<[boolean, string, number?, boolean?, string?, string?]> {
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

    console.log(`User location: ${userLat}, ${userLon}`);
    console.log(`Friend location: ${friendLat}, ${friendLon}`);

    if (distance < 0.0009 || friendLat == 'unknown' || friendLon == 'unknown') {
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
        // TODO: Fix this code. Streak and points logic broken. Also, make it take into account the meet interval
        const lastDate = new Date(lastMeetup.timestamp);
        const now = new Date();
        const yesterday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const lastDateDay = new Date(lastDate.getFullYear(), lastDate.getMonth(), lastDate.getDate());

        if ((lastDateDay.getTime() !== yesterday.getTime()) && (lastDateDay.getTime() !== today.getTime())) {
          console.log("Didn't meet up yesterday, so the streak gets reset to 1")
          const connectionRef = doc(db, "connections", connectionId);
          await setDoc(connectionRef, { streak: 1, streak_expire: new Date(now.getFullYear(), now.getMonth(), now.getDate() + 2) }, { merge: true });
        } else if (lastDateDay.getTime() == today.getTime()) {
          console.log("Last meeting was in the same day, so nothing happens to the streak")
        } else {
          const connectionRef = doc(db, "connections", connectionId);
          const connectionSnap = await getDoc(connectionRef);
          streak = 2;
          if (connectionSnap.exists()) {
            const data = connectionSnap.data();
            if (typeof data.streak === "number") {
              streak = data.streak + 1;
              streakIncreased = true;

              // Update points for both users robustly
              try {
                // User points update
                const userRef = doc(db, "users", userUid);
                const friendRef = doc(db, "users", friendId);

                console.log("[Meetup] userUid:", userUid, "userRef.path:", userRef.path);
                console.log("[Meetup] friendId:", friendId, "friendRef.path:", friendRef.path);

                // Get user points (handle missing doc/field)
                let userPoints = 0;
                const userSnap = await getDoc(userRef);
                if (userSnap.exists()) {
                  const data = userSnap.data();
                  userPoints = typeof data.points === "number" ? data.points : 0;
                } else {
                  console.log("[Meetup] User document does not exist, will create with points=1");
                }
                await setDoc(userRef, { points: userPoints + 1 }, { merge: true });
                console.log("[Meetup] Updated user points to", userPoints + 1);

                // Get friend points (handle missing doc/field)
                let friendPoints = 0;
                const friendSnap = await getDoc(friendRef);
                if (friendSnap.exists()) {
                  const data = friendSnap.data();
                  friendPoints = typeof data.points === "number" ? data.points : 0;
                } else {
                  console.log("[Meetup] Friend document does not exist, will create with points=1");
                }
                await setDoc(friendRef, { points: friendPoints + 1 }, { merge: true });
                console.log("[Meetup] Updated friend points to", friendPoints + 1);
              } catch (err) {
                console.error("[Meetup] Error updating points:", err);
              }
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

      const meetUp = await addDoc(meetupsCollectionRef, newMeetup);

      return [true, "Success", streak, streakIncreased, friendData.connectionId, meetUp.id];
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
  const [processMeetUpSuccess, setProcessMeetUpSuccess] = useState<[boolean, string, number?, boolean?, string?, string?] | null>(null);
  const scannerRef = useRef<QrScanner | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const hasScanned = useRef(false);
  const [showSelfieModal, setShowSelfieModal] = useState(false);
  const [showStreak, setShowStreak] = useState(false)

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
                console.log("Scanned data:", result.data);
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
    <div className="relative w-screen h-[calc(100vh-4rem)] bg-black">
      <video
        ref={videoRef}
        className={`absolute top-0 left-0 w-full h-full object-cover 'hidden'`}
        autoPlay
        muted
        playsInline
      />

      <canvas
        ref={canvasRef}
        className={`absolute top-0 left-0 w-full h-full object-cover 'hidden'`}
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
            🎉 Meetup confirmed!
            <br />
            {(!showStreak) ? (
              <>
                <p>Optional: </p>
                <button
                  className="mt-2 bg-white text-black px-3 py-1 rounded cursor-pointer hover:bg-gray-100 transition"
                  onClick={() => setShowSelfieModal(true)}
                >
                  Add a Selfie
                </button>
                <button className="mt-2 bg-white text-black px-3 py-1 rounded cursor-pointer hover:bg-gray-100 transition ml-2" onClick={() => setShowStreak(true)}>No</button>
              </>
            ) : (
              <>
                Streak: <br />
                {processMeetUpSuccess[3] ? (<StreakAnimation streak={((processMeetUpSuccess[2] ?? 0) - 1)}></StreakAnimation>) : (<p>{processMeetUpSuccess[2]} (Streak not increased)</p>)}
                <Image src="https://media2.giphy.com/media/v1.Y2lkPTZjMDliOTUyM2JpaHBvdnJoaXZkMGJsMWZrb2N5a3p2eXptdHF5N252a2FjNnR6ZiZlcD12MV9zdGlja2Vyc19zZWFyY2gmY3Q9ZQ/J2awouDsf23R2vo2p5/source.gif" width={24} height={24} alt='GIF of flame' />
                <Button onClick={() => window.location.reload()}>OK</Button>
                {/* TODO: add sharing streaks (need to generate like an image of the streak like duolingo) */}
              </>
            )}

          </div>
        )}

        {(processMeetUpSuccess && processMeetUpSuccess[0] === false) && (
          <div className="bg-yellow-600 bg-opacity-80 p-4 rounded text-white text-lg mt-4">
            ❌ Meetup failed. Please try again. {processMeetUpSuccess[1]}
            <br />
            <Button onClick={() => { window.location.reload() }}>Try again</Button>
          </div>
        )}

        {error && (
          <div className="bg-red-600 bg-opacity-80 p-4 rounded text-white text-lg mt-4">
            ⚠️ Error: {error}
            <br />
            <Button onClick={() => { window.location.reload() }}>Try again</Button>
          </div>
        )}


        {showSelfieModal && (
          <SelfieCaptureModal
            onClose={() => setShowSelfieModal(false)}
            onUpload={(imgUrl, caption) => {
              console.log("Uploaded selfie URL:", imgUrl);
              console.log("Caption:", caption);
              if (!processMeetUpSuccess || !processMeetUpSuccess[4] || !processMeetUpSuccess[5]) {
                console.error("No connection ID or meetup ID available for selfie upload");
                return;
              }
              // Add selfie_url and caption to the specific meetup document
              const meetupDocRef = doc(
                db,
                "connections",
                processMeetUpSuccess[4] as string,
                "meetups",
                processMeetUpSuccess[5] as string
              );
              setDoc(
                meetupDocRef,
                {
                  selfie_url: imgUrl,
                  caption,
                },
                { merge: true }
              );

              setShowStreak(true)
            }}
          />
        )}

      </div>
    </div>
  );
}

export default function QrScanPage() {
  // Track individual permission states
  const [cameraPermission, setCameraPermission] = useState<'granted' | 'denied' | 'prompt' | 'unknown'>('unknown');
  const [geoPermission, setGeoPermission] = useState<'granted' | 'denied' | 'prompt' | 'unknown'>('unknown');
  const [expanded, setExpanded] = useState(false);
  const [qrSize, setQrSize] = useState<number | null>(null);
  const [qrText, setQrText] = useState<string>('0');
  const [permissionsChecked, setPermissionsChecked] = useState(false);
  const [firstPermissionCheck, setFirstPermissionCheck] = useState(true);
  const showPermissionPopup =
    permissionsChecked &&
    (cameraPermission !== 'granted' || geoPermission !== 'granted');

  // Function to check permissions
  const checkPermissions = async () => {
    // iOS Safari does not support Permissions API for camera, so we check by trying to access the devices directly
    let cameraStatus: 'granted' | 'denied' | 'prompt' | 'unknown' = 'unknown';
    let geoStatus: 'granted' | 'denied' | 'prompt' | 'unknown' = 'unknown';

    // Check camera permission by attempting to access the camera
    try {
      await navigator.mediaDevices.getUserMedia({ video: true });
      cameraStatus = 'granted';
    } catch (err: any) {
      if (err && (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError')) {
        cameraStatus = 'denied';
      } else {
        cameraStatus = 'prompt';
      }
    }

    // Check geolocation permission by attempting to access geolocation
    if (navigator.geolocation) {
      await new Promise<void>((resolve) => {
        navigator.geolocation.getCurrentPosition(
          () => {
            geoStatus = 'granted';
            resolve();
          },
          (error) => {
            if (error.code === error.PERMISSION_DENIED) {
              geoStatus = 'denied';
            } else {
              geoStatus = 'prompt';
            }
            resolve();
          },
          { timeout: 1000 }
        );
      });
    } else {
      geoStatus = 'unknown';
    }

    setCameraPermission(cameraStatus);
    setGeoPermission(geoStatus);
    setPermissionsChecked(true);
  };

  // Only check permissions after mount and when user clicks Next
  useEffect(() => {
    checkPermissions();
    // Listen for permission changes
    let cameraPerm: any, geoPerm: any;
    if (typeof navigator !== 'undefined' && navigator.permissions) {
      navigator.permissions.query({ name: 'camera' as PermissionName }).then((perm) => {
        cameraPerm = perm;
        perm.onchange = () => setCameraPermission(perm.state);
      });
      navigator.permissions.query({ name: 'geolocation' as PermissionName }).then((perm) => {
        geoPerm = perm;
        perm.onchange = () => setGeoPermission(perm.state);
      });
    }
    return () => {
      if (cameraPerm) cameraPerm.onchange = null;
      if (geoPerm) geoPerm.onchange = null;
    };
  }, []);

  // When firstPermissionCheck changes to false, re-check permissions
  useEffect(() => {
    if (!firstPermissionCheck) {
      checkPermissions();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [firstPermissionCheck]);

  useEffect(() => {
    const updateSize = () => {
      setQrSize(Math.min(window.innerWidth * 0.75, window.innerHeight * 0.75));
    };
    updateSize();
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, []);

  // Only run QR code geolocation effect after permissions popup is dismissed
  useEffect(() => {
    if (showPermissionPopup) return;
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
        const userUid = (window as any).__currentUserUid || '';
        setQrText(`${userUid},${Date.now()},${geo}`);
      }
    };
    setTimeout(updateQrText, 250);
    interval = setInterval(updateQrText, 2500);
    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [showPermissionPopup]);

  return (
    <PageProtected>
      {(user) => {
        if (typeof window !== 'undefined') {
          (window as any).__currentUserUid = user.uid;
        }
        return (
          <>
            <TopNavbar />
            {showPermissionPopup && (
              <div className="fixed inset-0 z-49 flex flex-col items-center justify-center bg-black bg-opacity-90">
                <div className="bg-white rounded-lg shadow-lg p-8 max-w-sm w-full flex flex-col items-center">
                  <h2 className="text-xl font-bold mb-4 text-center">Permissions Required</h2>
                  <p className="mb-4 text-gray-700 text-center">
                    This app needs access to your <b>camera</b> to scan your friend's QR code, and your <b>location</b> to verify you are together for a meetup.
                  </p>
                  <ul className="mb-4 w-full">
                    <li className="flex items-center mb-2">
                      {cameraPermission === 'granted' ? (
                        <span className="text-green-600 mr-2">✅</span>
                      ) : (
                        <span className="text-red-600 mr-2">❌</span>
                      )}
                      <span>Camera Permission</span>
                    </li>
                    <li className="flex items-center">
                      {geoPermission === 'granted' ? (
                        <span className="text-green-600 mr-2">✅</span>
                      ) : (
                        <span className="text-red-600 mr-2">❌</span>
                      )}
                      <span>Location Permission</span>
                    </li>
                  </ul>
                  {firstPermissionCheck ? (<p className='text-gray-700 text-center mb-4'>Please grant the required permissions in the following popups to continue.</p>) : (<Link href="https://www.computerhope.com/issues/ch002358.htm" target="_blank" className='text-blue-600 hover:underline mb-4'>How to enable permissions manually</Link>)}
                  <button
                    className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2 rounded transition cursor-pointer"
                    onClick={() => { setFirstPermissionCheck(false); checkPermissions(); }}
                  >
                    {firstPermissionCheck ? 'Ok' : 'Check again'}
                  </button>
                </div>
              </div>
            )}
            <div className="relative w-full h-[calc(100vh-4rem)] overflow-hidden">
              {/* Only render QrScannerComponent after permissions popup is dismissed */}
              {!showPermissionPopup && <QrScannerComponent />}
              {expanded && qrSize !== null ? (
                <div
                  className="fixed inset-0 z-25 flex flex-col items-center justify-center bg-black bg-opacity-80 cursor-pointer"
                  onClick={() => setExpanded(false)}
                >
                  <span className="mb-2 text-white font-semibold">Your QR code</span>
                  <div className="shadow flex flex-col items-center">
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
