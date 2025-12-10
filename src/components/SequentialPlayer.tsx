'use client';

import React from 'react';
import { useSpotifyPlayerContext } from '../contexts/SpotifyPlayerContext';

interface SequentialPlayerProps {
    trackUri: string;
    durationMs: number; // Expected from parent via API
}

export default function SequentialPlayer({ trackUri, durationMs }: SequentialPlayerProps) {
    const {
        currentTrackUri,
        isPaused,
        position,
        play,
        pause,
        seek
    } = useSpotifyPlayerContext();

    const isThisTrack = currentTrackUri === trackUri;
    const isPlaying = isThisTrack && !isPaused;

    // Use live position if active, otherwise 0
    const currentPos = isThisTrack ? position : 0;
    // Prefer API duration passed in props (so we show it even before play), fallback to Context duration if active
    const displayDuration = durationMs || 0;

    const handlePlayPause = () => {
        if (isPlaying) {
            pause();
        } else {
            play(trackUri);
        }
    };

    const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!isThisTrack || !displayDuration) return;
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const pct = x / rect.width;
        seek(pct * displayDuration);
    };

    const formatTime = (ms: number) => {
        const totalSec = Math.floor(ms / 1000);
        const min = Math.floor(totalSec / 60);
        const sec = totalSec % 60;
        return `${min}:${sec < 10 ? '0' : ''}${sec}`;
    };

    return (
        <div className="w-full max-w-md flex flex-col gap-4 p-4 bg-orange-50 rounded-xl border border-orange-100 shadow-sm">
            <div className="flex items-center justify-center gap-6">
                <button
                    onClick={() => seek(0)}
                    className="w-10 h-10 flex items-center justify-center rounded-full border border-orange-600 text-orange-600 hover:bg-orange-600 hover:text-white transition-colors"
                    title="Restart"
                >
                    ↺
                </button>
                <button
                    onClick={handlePlayPause}
                    className={`w-14 h-14 flex items-center justify-center rounded-full text-white text-2xl shadow-lg transition-transform active:scale-95 ${isPlaying ? 'bg-gray-800' : 'bg-orange-600 hover:bg-orange-700'}`}
                >
                    {isPlaying ? '⏸' : '▶'}
                </button>
            </div>

            <div className="flex flex-col gap-1 w-full">
                <div
                    className="w-full h-2 bg-gray-200 rounded-full cursor-pointer relative overflow-hidden"
                    onClick={handleSeek}
                >
                    <div
                        className="h-full bg-orange-600 transition-all duration-200 ease-linear"
                        style={{ width: `${(currentPos / (displayDuration || 1)) * 100}%` }}
                    />
                </div>
                <div className="flex justify-between text-xs text-gray-500 font-mono">
                    <span>{formatTime(currentPos)}</span>
                    <span>{formatTime(displayDuration)}</span>
                </div>
            </div>
        </div>
    );
}
