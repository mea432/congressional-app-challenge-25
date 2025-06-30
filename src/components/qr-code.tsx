import React from 'react';
import { useQRCode } from 'next-qrcode';
import { useEffect, useState } from 'react';

type QRCodeProps = {
    text: string;
    width: number;
    className?: string;
};

function QRCode({ text, width, className }: QRCodeProps) {
    const { Canvas } = useQRCode();

    return (
        <div className={className}>
            <Canvas
                text={text}
                options={{
                    errorCorrectionLevel: 'M',
                    margin: 2,
                    scale: 1,
                    width: width,
                    color: {
                        dark: '#010599FF',
                        light: '#FFBF60FF',
                    },
                }}
            />
        </div>
    );
}

export default QRCode;




/*
//time code
import { useState, useEffect } from 'react';

export default function Clock() {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(new Date());
    }, 1000); // update every second

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="text-center p-4">
      <h2 className="text-xl font-semibold">Local Date and Time</h2>
      <p className="text-lg">{time.toLocaleDateString()}</p>
      <p className="text-lg">{time.toLocaleTimeString()}</p>
    </div>
  );
}
  */

/*
    // location tracker
    const LocationTracker = () => {
      const [location, setLocation] = useState(null);
      const [error, setError] = useState(null);

      useEffect(() => {
        if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              setLocation({
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
              });
              setError(null);
            },
            (err) => {
              setError(err.message);
              setLocation(null);
            }
          );
        } else {
          setError("Geolocation is not supported by this browser.");
        }
      }, []);

      return (
        <div>
          {location ? (
            <p>
              Latitude: {location.latitude}, Longitude: {location.longitude}
            </p>
          ) : (
            <p>{error || "Getting location..."}</p>
          )}
        </div>
      );
    };

    export default LocationTracker;
    */