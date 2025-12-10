'use client';

import { useEffect, useState } from 'react';

declare global {
    interface Window {
        Spotify: any;
        onSpotifyWebPlaybackSDKReady: () => void;
    }
}

export function useSpotifyPlayer(accessToken: string) {
    const [player, setPlayer] = useState<any>(undefined);
    const [deviceId, setDeviceId] = useState<string | null>(null);
    const [isPaused, setIsPaused] = useState(false);
    const [isActive, setIsActive] = useState(false);
    const [currentTrack, setCurrentTrack] = useState<any>(null);

    useEffect(() => {
        if (!accessToken) return;

        const script = document.createElement('script');
        script.src = 'https://sdk.scdn.co/spotify-player.js';
        script.async = true;

        document.body.appendChild(script);

        window.onSpotifyWebPlaybackSDKReady = () => {
            const p = new window.Spotify.Player({
                name: 'Pixel Tunes Web Player',
                getOAuthToken: (cb: any) => {
                    cb(accessToken);
                },
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
                if (!state) return;
                setCurrentTrack(state.track_window.current_track);
                setIsPaused(state.paused);
                p.getCurrentState().then((s: any) => {
                    setIsActive(!!s);
                });
            });

            p.connect();
        };

        return () => {
            // Cleanup: script removal? player disconnect?
        };
    }, [accessToken]);

    return { player, deviceId, isPaused, isActive, currentTrack };
}
