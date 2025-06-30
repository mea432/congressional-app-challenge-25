import React from 'react';
import { useQRCode } from 'next-qrcode';

function QRCode() {
  const { Canvas } = useQRCode();

  return (
    <Canvas
      text={'https://github.com/bunlong/next-qrcode'}
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