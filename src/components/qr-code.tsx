import React from 'react';
import { useQRCode } from 'next-qrcode';

type QRCodeProps = {
    text: string;
    className?: string;
};

function QRCode({ text, className }: QRCodeProps) {
    const { Canvas } = useQRCode();

    return (
        <div className={className}>
            <Canvas
                text={text}
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
        </div>
    );
}

export default QRCode;