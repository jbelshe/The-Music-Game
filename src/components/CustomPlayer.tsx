'use client';

import { useEffect, useRef, useState } from 'react';

interface CustomPlayerProps {
    src: string;
    isPlaying?: boolean;
    onPlayPause?: (playing: boolean) => void;
    autoPlay?: boolean;
}

export default function CustomPlayer({ src, isPlaying: externalIsPlaying, onPlayPause, autoPlay = false }: CustomPlayerProps) {
    const audioRef = useRef<HTMLAudioElement>(null);
    const [playing, setPlaying] = useState(false);
    const [progress, setProgress] = useState(0);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);

    useEffect(() => {
        if (externalIsPlaying !== undefined) {
            setPlaying(externalIsPlaying);
            if (externalIsPlaying) {
                audioRef.current?.play().catch(() => { });
            } else {
                audioRef.current?.pause();
            }
        }
    }, [externalIsPlaying]);

    useEffect(() => {
        // Reset state on src change
        setPlaying(false);
        setProgress(0);
        setCurrentTime(0);

        if (autoPlay && audioRef.current) {
            // Tiny timeout for browser to be ready
            setTimeout(() => {
                audioRef.current?.play().then(() => {
                    setPlaying(true);
                    onPlayPause?.(true);
                }).catch(() => {
                    // Autoplay blocked
                });
            }, 100);
        }
    }, [src, autoPlay]);

    const togglePlay = () => {
        const newState = !playing;
        setPlaying(newState);
        if (newState) {
            audioRef.current?.play();
        } else {
            audioRef.current?.pause();
        }
        onPlayPause?.(newState);
    };

    const restart = () => {
        if (audioRef.current) {
            audioRef.current.currentTime = 0;
            audioRef.current.play();
            setPlaying(true);
            onPlayPause?.(true);
        }
    };

    const handleTimeUpdate = () => {
        if (audioRef.current) {
            const d = audioRef.current.duration;
            const c = audioRef.current.currentTime;
            if (d > 0) {
                setDuration(d);
                setCurrentTime(c);
                setProgress((c / d) * 100);
            }
        }
    };

    const handleEnded = () => {
        setPlaying(false);
        onPlayPause?.(false);
        setProgress(0);
        setCurrentTime(0);
    };

    const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!audioRef.current) return;
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const width = rect.width;
        const percentage = x / width;
        const d = audioRef.current.duration;
        if (d > 0) {
            audioRef.current.currentTime = percentage * d;
        }
    };

    const formatTime = (time: number) => {
        const min = Math.floor(time / 60);
        const sec = Math.floor(time % 60);
        return `${min}:${sec < 10 ? '0' : ''}${sec}`;
    };

    return (
        <div className="flex flex-col w-full max-w-xs gap-3">
            <audio
                ref={audioRef}
                src={src}
                onTimeUpdate={handleTimeUpdate}
                onEnded={handleEnded}
                onLoadedMetadata={(e) => setDuration(e.currentTarget.duration)}
            />

            <div className="flex items-center justify-center gap-6">
                <button
                    onClick={restart}
                    className="w-10 h-10 flex items-center justify-center rounded-full border border-current hover:bg-black hover:text-white transition-colors"
                    aria-label="Restart"
                >
                    ↺
                </button>
                <button
                    onClick={togglePlay}
                    className="w-12 h-12 flex items-center justify-center rounded-full border border-current hover:bg-black hover:text-white transition-colors text-xl"
                >
                    {playing ? '||' : '▶'}
                </button>
            </div>

            <div className="w-full flex flex-col gap-1">
                <div
                    className="w-full h-2 bg-gray-200 rounded-full cursor-pointer relative overflow-hidden"
                    onClick={handleSeek}
                >
                    <div
                        className="h-full bg-black transition-all duration-100 ease-linear"
                        style={{ width: `${progress}%` }}
                    />
                </div>
                <div className="flex justify-between text-xs text-gray-500 font-mono">
                    <span>{formatTime(currentTime)}</span>
                    <span>{formatTime(duration || 0)}</span>
                </div>
            </div>
        </div>
    );
}
