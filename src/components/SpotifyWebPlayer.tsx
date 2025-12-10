'use client';

import { useEffect, useState } from 'react';
import { useSpotifyPlayer } from '../hooks/useSpotifyPlayer';

interface SpotifyWebPlayerProps {
    token: string;
    trackUri: string;
    autoPlay?: boolean;
}

export default function SpotifyWebPlayer({ token, trackUri, autoPlay = false }: SpotifyWebPlayerProps) {
    const { player, deviceId, isPaused, isActive, currentTrack } = useSpotifyPlayer(token);
    const [progress, setProgress] = useState(0);
    const [duration, setDuration] = useState(0);

    // Auto-play when trackUri changes or player becomes ready
    useEffect(() => {
        if (deviceId && trackUri) {
            // We need to transfer playback to this device first or just play
            // The SDK requires a fetch to 'https://api.spotify.com/v1/me/player/play'
            // BUT the SDK 'player' object doesn't have a direct 'play(uri)' method easily exposed without connecting.
            // Easiest is to use the API to start playback on this device.

            const playTrack = async () => {
                try {
                    await fetch(`https://api.spotify.com/v1/me/player/play?device_id=${deviceId}`, {
                        method: 'PUT',
                        body: JSON.stringify({ uris: [trackUri] }),
                        headers: {
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${token}`
                        },
                    });
                } catch (e) {
                    console.error(e);
                }
            };

            if (autoPlay) {
                playTrack();
            }
        }
    }, [deviceId, trackUri, autoPlay, token]);

    // Polling for progress (SDK doesn't emit time updates frequently enough for smooth UI)
    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (player && !isPaused) {
            interval = setInterval(() => {
                player.getCurrentState().then((state: any) => {
                    if (!state) return;
                    setProgress(state.position);
                    setDuration(state.duration);
                });
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [player, isPaused]);

    const togglePlay = () => {
        player?.togglePlay();
    };

    const seek = (ms: number) => {
        player?.seek(ms);
    };

    const restart = () => {
        player?.seek(0);
    };

    const handleSeekClick = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!duration) return;
        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const pct = x / rect.width;
        seek(pct * duration);
    };

    const formatTime = (ms: number) => {
        const totalSec = Math.floor(ms / 1000);
        const min = Math.floor(totalSec / 60);
        const sec = totalSec % 60;
        return `${min}:${sec < 10 ? '0' : ''}${sec}`;
    };

    if (!isActive && !deviceId) {
        return <div className="text-sm text-gray-500">Initializing Player...</div>;
    }

    return (
        <div className="flex flex-col w-full max-w-xs gap-3">
            <div className="flex items-center justify-center gap-6">
                <button
                    onClick={restart}
                    className="w-10 h-10 flex items-center justify-center rounded-full border border-current hover:bg-black hover:text-white transition-colors"
                    title="Restart"
                >
                    ↺
                </button>
                <button
                    onClick={togglePlay}
                    className="w-12 h-12 flex items-center justify-center rounded-full border border-current hover:bg-black hover:text-white transition-colors text-xl"
                >
                    {isPaused ? '▶' : '||'}
                </button>
            </div>

            <div className="w-full flex flex-col gap-1">
                <div
                    className="w-full h-2 bg-gray-200 rounded-full cursor-pointer relative overflow-hidden"
                    onClick={handleSeekClick}
                >
                    <div
                        className="h-full bg-black transition-all duration-200 ease-linear"
                        style={{ width: `${(progress / (duration || 1)) * 100}%` }}
                    />
                </div>
                <div className="flex justify-between text-xs text-gray-500 font-mono">
                    <span>{formatTime(progress)}</span>
                    <span>{formatTime(duration)}</span>
                </div>
            </div>
        </div>
    );
}
