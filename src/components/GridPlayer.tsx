'use client';

import React from 'react';
import { useSpotifyPlayerContext } from '../contexts/SpotifyPlayerContext';

interface GridPlayerProps {
    trackUri: string;
    durationMs: number;
    savedPosition?: number;
    onPlay?: (uri: string) => void;
}

export default function GridPlayer({ trackUri, durationMs, savedPosition = 0, onPlay }: GridPlayerProps) {
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
    const currentPos = isThisTrack ? position : savedPosition;
    const displayDuration = durationMs || 0;

    const handlePlayPause = () => {
        if (isPlaying) {
            pause();
        } else {
            if (onPlay) {
                onPlay(trackUri);
            } else {
                play(trackUri);
            }
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
        <div className="flex flex-col w-full max-w-[200px] gap-2">
            <div className="flex items-center gap-3">
                <button
                    onClick={handlePlayPause}
                    className={`w-10 h-10 flex-shrink-0 flex items-center justify-center rounded-full text-white shadow-md transition-all active:scale-95 bg-green-600 hover:bg-green-700`}
                >
                    {isPlaying ? '⏸' : '▶'}
                </button>

                <div className="flex-1 flex flex-col justify-center">
                    <div
                        className="w-full h-1.5 bg-gray-200 rounded-full cursor-pointer relative overflow-hidden"
                        onClick={handleSeek}
                    >
                        <div
                            className="h-full bg-green-600 transition-all duration-200 ease-linear"
                            style={{ width: `${(currentPos / (displayDuration || 1)) * 100}%` }}
                        />
                    </div>
                </div>
            </div>
            <div className="flex justify-between text-[10px] text-gray-500 font-mono px-1">
                <span>{formatTime(currentPos)}</span>
                <span>{formatTime(displayDuration)}</span>
            </div>
        </div>
    );
}
