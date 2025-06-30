import React from 'react';
import { useQRCode } from 'next-qrcode';

function QRCode() {
  const { Canvas } = useQRCode();

  return (
    <Canvas 
      text={"https://reverse-social-app.vercel.app/home"}
      options={{
        errorCorrectionLevel: 'M',
        margin: 3,
        scale: 4,
        width: 200,
        color: {
          dark: '#010599FF',
          light: '#FFBF60FF',
        },
      }}
    />
  );
}
export default QRCode;