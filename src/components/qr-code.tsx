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




