'use client';

import { useState } from 'react';
import { SONGS } from '../data/songs';
import PixelatedImage from './PixelatedImage';
import CustomPlayer from './CustomPlayer';
import ArtistInput from './ArtistInput';
import YearSelect from './YearSelect';

export default function SimultaneousGame() {
    const gameSongs = SONGS.slice(0, 4);

    const [playingId, setPlayingId] = useState<string | null>(null);

    const [guesses, setGuesses] = useState<{ [key: string]: { artist: string, year: number | '' } }>(
        Object.fromEntries(gameSongs.map(s => [s.id, { artist: '', year: '' }]))
    );

    const [submitted, setSubmitted] = useState(false);
    const [errorIds, setErrorIds] = useState<string[]>([]); // Track empty artist fields

    const handlePlayPause = (id: string, isPlaying: boolean) => {
        if (isPlaying) {
            setPlayingId(id);
        } else if (playingId === id) {
            setPlayingId(null);
        }
    };

    const handleInputChange = (id: string, field: 'artist' | 'year', value: any) => {
        setGuesses(prev => ({
            ...prev,
            [id]: { ...prev[id], [field]: value }
        }));
        // Clear error if typing
        if (field === 'artist' && errorIds.includes(id)) {
            setErrorIds(prev => prev.filter(eid => eid !== id));
        }
    };

    const handleSubmit = () => {
        // Validate: all artists must be filled?
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
        setPlayingId(null);
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
                                <img src={song.coverUrl} className="w-32 h-32 rounded-lg object-cover" />
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
                            <PixelatedImage src={song.coverUrl} pixelFactor={25} />
                        </div>

                        <div className="w-full flex justify-center">
                            <CustomPlayer
                                src={song.audioUrl}
                                isPlaying={playingId === song.id}
                                onPlayPause={(playing) => handlePlayPause(song.id, playing)}
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
                    className="px-10 py-4 bg-green-600 text-white text-lg font-bold rounded-full shadow-lg hover:bg-green-700 hover:scale-105 transition-all"
                >
                    Submit All
                </button>
            </div>
        </div>
    );
}
