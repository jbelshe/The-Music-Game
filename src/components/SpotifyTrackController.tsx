'use client';

import React from 'react';
import { useSpotifyPlayerContext } from '../contexts/SpotifyPlayerContext';

interface SpotifyTrackControllerProps {
    trackUri: string;
    onPlay?: () => void;
    theme?: 'orange' | 'green';
}

export default function SpotifyTrackController({ trackUri, onPlay, theme = 'orange' }: SpotifyTrackControllerProps) {
    const {
        currentTrackUri,
        isPaused,
        position,
        duration,
        play,
        pause,
        seek
    } = useSpotifyPlayerContext();

    const isThisTrack = currentTrackUri === trackUri;
    const isPlaying = isThisTrack && !isPaused;

    // Fallback duration if not active yet or not this track
    // If it's not this track, we show 0 or static.
    const currentPos = isThisTrack ? position : 0;
    const currentDur = isThisTrack ? duration : 0;

    const handlePlayPause = () => {
        if (isPlaying) {
            pause();
        } else {
            play(trackUri);
            if (onPlay) onPlay();
        }
    };

    const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!isThisTrack || !currentDur) return;
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const pct = x / rect.width;
        seek(pct * currentDur);
    };

    const formatTime = (ms: number) => {
        const totalSec = Math.floor(ms / 1000);
        const min = Math.floor(totalSec / 60);
        const sec = totalSec % 60;
        return `${min}:${sec < 10 ? '0' : ''}${sec}`;
    };

    const accentColor = theme === 'orange' ? 'bg-orange-600' : 'bg-green-600';
    const hoverColor = theme === 'orange' ? 'hover:bg-orange-700' : 'hover:bg-green-700';

    return (
        <div className="flex flex-col w-full max-w-sm gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200 shadow-sm">
            <div className="flex items-center gap-4">
                <button
                    onClick={handlePlayPause}
                    className={`w-10 h-10 flex items-center justify-center rounded-full text-white transition-all shadow-md active:scale-95 ${isPlaying ? 'bg-gray-800' : `${accentColor} ${hoverColor}`}`}
                >
                    {isPlaying ? '⏸' : '▶'}
                </button>

                <div className="flex-1 flex flex-col gap-1">
                    <div
                        className="w-full h-2 bg-gray-200 rounded-full cursor-pointer relative overflow-hidden"
                        onClick={handleSeek}
                    >
                        <div
                            className={`h-full transition-all duration-200 ease-linear ${accentColor}`}
                            style={{ width: `${(currentPos / (currentDur || 1)) * 100}%` }}
                        />
                    </div>
                    <div className="flex justify-between text-xs text-gray-500 font-mono">
                        <span>{formatTime(currentPos)}</span>
                        <span>{formatTime(currentDur)}</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
