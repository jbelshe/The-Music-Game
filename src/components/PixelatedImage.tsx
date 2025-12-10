'use client';

import { useEffect, useRef, useState } from 'react';

interface PixelatedImageProps {
    src: string;
    pixelFactor?: number;
}

export default function PixelatedImage({ src, pixelFactor = 25 }: PixelatedImageProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [loaded, setLoaded] = useState(false);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        ctx.imageSmoothingEnabled = false;

        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.src = src;

        img.onload = () => {
            const w = img.width;
            const h = img.height;

            const smallW = Math.max(1, Math.floor(w / pixelFactor));
            const smallH = Math.max(1, Math.floor(h / pixelFactor));

            canvas.width = smallW;
            canvas.height = smallH;

            ctx.drawImage(img, 0, 0, smallW, smallH);
            setLoaded(true);
        };
    }, [src, pixelFactor]);

    return (
        <div className="w-full h-full relative overflow-hidden rounded-lg shadow-md bg-gray-100 flex items-center justify-center">
            <canvas
                ref={canvasRef}
                style={{
                    width: '100%',
                    height: '100%',
                    imageRendering: 'pixelated',
                    objectFit: 'cover'
                }}
                className="block"
            />
            {!loaded && <div className="absolute inset-0 flex items-center justify-center text-gray-500 text-sm">Loading...</div>}
        </div>
    );
}
