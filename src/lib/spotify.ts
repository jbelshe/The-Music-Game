const SPOTIFY_API_BASE = 'https://api.spotify.com/v1';

export interface SpotifyTrack {
    id: string;
    name: string;
    duration_ms: number;
    album: {
        images: { url: string; height: number; width: number }[];
    };
}

export async function getTrackDetails(accessToken: string, trackId: string): Promise<SpotifyTrack> {
    const res = await fetch(`${SPOTIFY_API_BASE}/tracks/${trackId}`, {
        headers: {
            Authorization: `Bearer ${accessToken}`,
        },
    });

    if (!res.ok) {
        throw new Error(`Failed to fetch track details for ${trackId}: ${res.statusText}`);
    }

    return res.json();
}
