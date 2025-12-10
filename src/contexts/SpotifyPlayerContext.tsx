'use client';

import React, { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';

interface SpotifyPlayerContextType {
    player: any;
    deviceId: string | null;
    isPaused: boolean;
    isActive: boolean;
    currentTrackUri: string | null;
    position: number;
    duration: number; // Duration from SDK state
    play: (uri: string, position_ms?: number) => Promise<void>;
    pause: () => void;
    seek: (pos: number) => void;
}

const SpotifyPlayerContext = createContext<SpotifyPlayerContextType | undefined>(undefined);

export function useSpotifyPlayerContext() {
    const context = useContext(SpotifyPlayerContext);
    if (!context) {
        throw new Error('useSpotifyPlayerContext must be used within a SpotifyPlayerProvider');
    }
    return context;
}

interface ProviderProps {
    children: ReactNode;
    accessToken: string;
}

export function SpotifyPlayerProvider({ children, accessToken }: ProviderProps) {
    const [player, setPlayer] = useState<any>(undefined);
    const [deviceId, setDeviceId] = useState<string | null>(null);
    const [isPaused, setIsPaused] = useState(false);
    const [isActive, setIsActive] = useState(false);
    const [currentTrackUri, setCurrentTrackUri] = useState<string | null>(null);
    const [position, setPosition] = useState(0);
    const [duration, setDuration] = useState(0);

    // Initialize Player
    useEffect(() => {
        if (!accessToken) return;

        const script = document.createElement('script');
        script.src = 'https://sdk.scdn.co/spotify-player.js';
        script.async = true;
        document.body.appendChild(script);

        window.onSpotifyWebPlaybackSDKReady = () => {
            const p = new window.Spotify.Player({
                name: 'Pixel Tunes Central',
                getOAuthToken: (cb: any) => { cb(accessToken); },
                volume: 0.5,
            });

            setPlayer(p);

            p.addListener('ready', ({ device_id }: any) => {
                console.log('Ready with Device ID', device_id);
                setDeviceId(device_id);
            });

            p.addListener('not_ready', ({ device_id }: any) => {
                console.log('Device ID has gone offline', device_id);
                setDeviceId(null);
            });

            p.addListener('player_state_changed', (state: any) => {
                if (!state) {
                    setIsActive(false);
                    return;
                }
                setCurrentTrackUri(state.track_window.current_track.uri);
                setIsPaused(state.paused);
                setPosition(state.position);
                setDuration(state.duration);

                p.getCurrentState().then((s: any) => {
                    setIsActive(!!s);
                });
            });

            p.addListener('initialization_error', ({ message }: any) => { console.error('Init Error:', message); });
            p.addListener('authentication_error', ({ message }: any) => { console.error('Auth Error:', message); });
            p.addListener('account_error', ({ message }: any) => { console.error('Account Error:', message); });
            p.addListener('playback_error', ({ message }: any) => { console.error('Playback Error:', message); });

            p.connect();
        };

        return () => {
            // Cleanup if needed
        };
    }, [accessToken]);

    // Polling for smooth progress
    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (player && !isPaused && isActive) {
            interval = setInterval(() => {
                player.getCurrentState().then((state: any) => {
                    if (!state) return;
                    setPosition(state.position);
                });
            }, 500); // Poll every 500ms
        }
        return () => clearInterval(interval);
    }, [player, isPaused, isActive]);


    const play = useCallback(async (uri: string, position_ms: number = 0) => {
        if (!deviceId) {
            console.error("No Device ID available to play on. Player might not be ready or authenticated.");
            return;
        }

        // If resuming same song
        if (uri === currentTrackUri && isPaused) {
            try {
                await player.togglePlay();
            } catch (err) {
                console.warn("Toggle play failed, forcing reload:", err);
                // Fall through to full play call
            }
            return;
        }

        console.log(`Starting playback for ${uri} on device ${deviceId} at ${position_ms}ms`);
        // New song
        try {
            await fetch(`https://api.spotify.com/v1/me/player/play?device_id=${deviceId}`, {
                method: 'PUT',
                body: JSON.stringify({
                    uris: [uri],
                    position_ms: position_ms
                }),
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${accessToken}`
                },
            });
        } catch (e) {
            console.error("Playback API Error:", e);
        }
    }, [deviceId, currentTrackUri, isPaused, player, accessToken]);

    const pause = useCallback(() => {
        if (isActive) {
            player?.pause();
        }
    }, [player, isActive]);

    const seek = useCallback((pos: number) => {
        player?.seek(pos);
    }, [player]);

    return (
        <SpotifyPlayerContext.Provider value={{
            player,
            deviceId,
            isPaused,
            isActive,
            currentTrackUri,
            position,
            duration,
            play,
            pause,
            seek
        }}>
            {children}
        </SpotifyPlayerContext.Provider>
    );
}
