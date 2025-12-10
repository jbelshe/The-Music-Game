'use client';

import { useState, useEffect } from 'react';
import { SONGS } from '../data/songs';
import PixelatedImage from './PixelatedImage';
import GridPlayer from './GridPlayer';
import ArtistInput from './ArtistInput';
import YearSelect from './YearSelect';
import { getTrackDetails, SpotifyTrack } from '../lib/spotify';
import { useSpotifyPlayerContext } from '../contexts/SpotifyPlayerContext';

interface SimultaneousGameProps {
    token: string;
}

export default function SimultaneousGame({ token }: SimultaneousGameProps) {
    const { play, currentTrackUri, position } = useSpotifyPlayerContext();
    const gameSongs = SONGS.slice(0, 4);
    const [covers, setCovers] = useState<{ [key: string]: string }>({});
    const [durations, setDurations] = useState<{ [key: string]: number }>({});

    // Track saved position (ms) for each track URI
    const [savedPositions, setSavedPositions] = useState<Record<string, number>>({});

    const handlePlayRequest = (uri: string) => {
        // 1. If something is currently playing (and it's not the one we just clicked), save its position
        if (currentTrackUri && currentTrackUri !== uri && position > 0) {
            setSavedPositions(prev => ({
                ...prev,
                [currentTrackUri]: position
            }));
        }

        // 2. Retrieve last known position for the requested URI (default 0)
        const startPos = savedPositions[uri] || 0;

        // 3. Play
        play(uri, startPos);
    };

    useEffect(() => {
        if (!token) return;
        gameSongs.forEach(song => {
            if (song.spotifyId) {
                getTrackDetails(token, song.spotifyId).then((data: SpotifyTrack) => {
                    const img = data.album.images[0]?.url;
                    if (img) setCovers(prev => ({ ...prev, [song.id]: img }));
                    if (data.duration_ms) setDurations(prev => ({ ...prev, [song.id]: data.duration_ms }));
                }).catch(e => console.error(e));
            }
        });
    }, [token]);

    const [guesses, setGuesses] = useState<{ [key: string]: { artist: string, year: number | '' } }>(
        Object.fromEntries(gameSongs.map(s => [s.id, { artist: '', year: '' }]))
    );

    const [submitted, setSubmitted] = useState(false);
    const [errorIds, setErrorIds] = useState<string[]>([]);

    const handleInputChange = (id: string, field: 'artist' | 'year', value: any) => {
        setGuesses(prev => ({
            ...prev,
            [id]: { ...prev[id], [field]: value }
        }));
        if (field === 'artist' && errorIds.includes(id)) {
            setErrorIds(prev => prev.filter(eid => eid !== id));
        }
    };

    const handleSubmit = () => {
        const newErrors: string[] = [];
        gameSongs.forEach(s => {
            if (!guesses[s.id].artist.trim()) {
                newErrors.push(s.id);
            }
        });

        if (newErrors.length > 0) {
            setErrorIds(newErrors);
            alert("Please fill in the artist for all songs marked in red.");
            return;
        }

        setSubmitted(true);
    };

    const isCorrect = (song: typeof SONGS[0]) => {
        const g = guesses[song.id];
        return {
            artistOk: g.artist.toLowerCase() === song.artist.toLowerCase(),
            yearOk: g.year === song.year
        };
    };

    const getScore = () => {
        let score = 0;
        gameSongs.forEach(s => {
            const { artistOk, yearOk } = isCorrect(s);
            if (artistOk) score++;
            if (yearOk) score++;
        });
        return score;
    };

    if (submitted) {
        const score = getScore();
        const maxScore = gameSongs.length * 2;
        return (
            <div className="flex flex-col items-center gap-8 w-full p-4">
                <h2 className="text-2xl font-bold text-green-700">Results</h2>
                <p className="text-xl font-semibold">Score: {score} / {maxScore}</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 w-full max-w-6xl">
                    {gameSongs.map(song => {
                        const { artistOk, yearOk } = isCorrect(song);
                        return (
                            <div key={song.id} className="flex flex-col items-center gap-4 p-4 border border-green-200 rounded-xl bg-green-50 shadow-sm">
                                <img src={covers[song.id] || song.coverUrl} className="w-32 h-32 rounded-lg object-cover" />
                                <div className="text-center space-y-2">
                                    <div className={artistOk ? 'text-green-600 font-bold' : 'text-red-500 line-through'}>
                                        {guesses[song.id].artist}
                                    </div>
                                    {!artistOk && <div className="text-gray-700 text-sm">{song.artist}</div>}

                                    <div className={yearOk ? 'text-green-600 font-bold' : 'text-red-500 line-through'}>
                                        {guesses[song.id].year}
                                    </div>
                                    {!yearOk && <div className="text-gray-700 text-sm">{song.year}</div>}
                                </div>
                            </div>
                        );
                    })}
                </div>
                <button onClick={() => window.location.reload()} className="px-8 py-3 bg-green-600 text-white rounded-full font-bold hover:bg-green-700 transition-transform hover:scale-105 shadow-lg">Play Again</button>
            </div>
        );
    }

    return (
        <div className="flex flex-col items-center gap-10 w-full p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-8 w-full max-w-7xl">
                {gameSongs.map((song) => (
                    <div key={song.id} className="flex flex-col items-center gap-6 p-6 border border-gray-100 rounded-2xl bg-white shadow-xl">
                        <div className="w-full aspect-square max-w-[250px] shadow-inner rounded-lg overflow-hidden bg-gray-50">
                            <PixelatedImage src={covers[song.id] || song.coverUrl} pixelFactor={25} />
                        </div>

                        <div className="w-full flex justify-center">
                            <GridPlayer
                                trackUri={`spotify:track:${song.spotifyId}`}
                                durationMs={durations[song.id]}
                                onPlay={handlePlayRequest}
                                savedPosition={savedPositions[`spotify:track:${song.spotifyId}`] || 0}
                            />
                        </div>

                        <div className="w-full space-y-3">
                            <ArtistInput
                                value={guesses[song.id].artist}
                                onChange={(val) => handleInputChange(song.id, 'artist', val)}
                                onSubmit={() => { }}
                                hasError={errorIds.includes(song.id)}
                            />
                            <div className="w-full">
                                <YearSelect
                                    value={guesses[song.id].year}
                                    onChange={(val) => handleInputChange(song.id, 'year', val)}
                                />
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="pb-10">
                <button
                    onClick={handleSubmit}
                    className="px-10 py-4 bg-green-600 text-white text-lg font-bold rounded-full shadow-lg hover:green-700 hover:scale-105 transition-all"
                >
                    Submit All
                </button>
            </div>
        </div>
    );
}
