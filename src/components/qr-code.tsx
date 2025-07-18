import React from 'react';
import { useQRCode } from 'next-qrcode';

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
          width: width,
          color: {
            dark: '#2563eb', // tailwind 'text-blue-600'
            light: '#DBEAFE', // tailwind 'text-blue-200'
          },
        }}
      />
    </div>
  );
}

export default QRCode;




