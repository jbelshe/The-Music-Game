'use client';

import { useState } from 'react';
import { SONGS } from '../data/songs';
import PixelatedImage from './PixelatedImage';
import CustomPlayer from './CustomPlayer';
import ArtistInput from './ArtistInput';

export default function SequentialGame() {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [correctCount, setCorrectCount] = useState(0);
    const [gameStatus, setGameStatus] = useState<'playing' | 'finished'>('playing');
    const [inputVal, setInputVal] = useState('');
    const [inputError, setInputError] = useState(false);

    // 'pending' | 'correct' | 'incorrect' | 'skipped'
    type SongStatus = 'pending' | 'correct' | 'incorrect' | 'skipped';
    const [songStatuses, setSongStatuses] = useState<SongStatus[]>(new Array(SONGS.length).fill('pending'));

    const currentSong = SONGS[currentIndex];
    // Check if current song is already guessed/skipped to show "Next" button instead of form
    const isDoneWithCurrent = songStatuses[currentIndex] !== 'pending';

    const handleGuess = () => {
        if (!inputVal.trim()) {
            setInputError(true);
            return;
        }
        setInputError(false);

        const isCorrect = inputVal.toLowerCase() === currentSong.artist.toLowerCase();

        // Update status
        const newStatuses = [...songStatuses];
        newStatuses[currentIndex] = isCorrect ? 'correct' : 'incorrect';
        setSongStatuses(newStatuses);

        if (isCorrect) {
            setCorrectCount(prev => prev + 1);
        }
    };

    const moveToNext = () => {
        if (currentIndex < SONGS.length - 1) {
            setCurrentIndex(currentIndex + 1);
            setInputVal('');
            setInputError(false);
        } else {
            setGameStatus('finished');
        }
    };

    const handleSkip = () => {
        const newStatuses = [...songStatuses];
        newStatuses[currentIndex] = 'skipped';
        setSongStatuses(newStatuses);
        // Instant next on skip? usually yes.
        moveToNext();
    };

    const jumpToSong = (index: number) => {
        // Allow jumping back to review?
        setCurrentIndex(index);
        setInputVal('');
        setInputError(false);
    };

    if (gameStatus === 'finished') {
        return (
            <div className="flex flex-col items-center gap-6 w-full max-w-lg mx-auto p-4">
                <h2 className="text-2xl font-bold text-orange-600">Results</h2>
                <p className="text-lg">You got {correctCount} out of {SONGS.length} correct.</p>
                <div className="w-full flex flex-col gap-3">
                    {SONGS.map((song, i) => (
                        <div key={song.id} className="flex items-center gap-4 p-3 border border-orange-100 rounded-lg bg-orange-50">
                            <img src={song.coverUrl} alt="cover" className="w-12 h-12 object-cover rounded" />
                            <div className="flex-1">
                                <div className="font-semibold">{song.title}</div>
                                <div className="text-sm text-gray-600">{song.artist}</div>
                            </div>
                            <span className={`font-bold ${songStatuses[i] === 'correct' ? 'text-green-600' :
                                    songStatuses[i] === 'skipped' ? 'text-orange-400' : 'text-red-500'
                                }`}>
                                {songStatuses[i]}
                            </span>
                        </div>
                    ))}
                </div>
                <button onClick={() => window.location.reload()} className="px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors">Play Again</button>
            </div>
        );
    }

    // Determine dot color based on status
    const getDotClass = (status: SongStatus, isActive: boolean) => {
        // Base styles
        let classes = "w-3 h-3 rounded-full transition-transform ";
        if (isActive) classes += "scale-150 border border-orange-600 ";

        switch (status) {
            case 'correct': classes += "bg-green-500"; break;
            case 'incorrect': classes += "bg-red-500"; break;
            case 'skipped': classes += "bg-yellow-400"; break;
            default: classes += "bg-gray-300"; break;
        }
        return classes;
    };

    return (
        <div className="flex flex-col items-center w-full max-w-2xl mx-auto gap-8 p-4">
            {/* Progress Dots */}
            <div className="flex gap-3 justify-center">
                {SONGS.map((_, i) => (
                    <button
                        key={i}
                        className={getDotClass(songStatuses[i], i === currentIndex)}
                        onClick={() => jumpToSong(i)}
                        title={`Song ${i + 1}`}
                    />
                ))}
            </div>

            <div className="text-xl font-bold text-orange-600">Correct: {correctCount}</div>

            <div className="flex flex-col items-center gap-8 w-full">
                {/* Cover & Player Container - Centered */}
                <div className="flex flex-col items-center gap-6 w-full">
                    <div className="w-64 h-64 shadow-lg rounded-lg overflow-hidden border-4 border-orange-100">
                        {/* 
                   Logic: 
                   - If correct, show clear image (factor 1).
                   - If incorrect/skipped/pending, show pixelated (factor 25).
                */}
                        <PixelatedImage
                            src={currentSong.coverUrl}
                            pixelFactor={songStatuses[currentIndex] === 'correct' ? 1 : 25}
                        />
                    </div>

                    <div className="w-full flex justify-center">
                        <CustomPlayer src={currentSong.audioUrl} />
                    </div>
                </div>

                <div className="w-full max-w-sm flex flex-col gap-4 items-center">
                    {!isDoneWithCurrent ? (
                        <>
                            <ArtistInput
                                value={inputVal}
                                onChange={(val) => { setInputVal(val); setInputError(false); }}
                                onSubmit={handleGuess}
                                hasError={inputError}
                            />
                            {inputError && <div className="text-red-500 text-sm">Please enter an artist name.</div>}

                            <div className="flex gap-4 w-full">
                                <button
                                    onClick={handleSkip}
                                    className="flex-1 py-2 rounded-md bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium transition-colors"
                                >
                                    Skip
                                </button>
                                <button
                                    onClick={handleGuess}
                                    className="flex-1 py-2 rounded-md bg-orange-500 hover:bg-orange-600 text-white font-medium transition-colors"
                                >
                                    Submit
                                </button>
                            </div>
                        </>
                    ) : (
                        <div className="text-center w-full bg-orange-50 p-6 rounded-lg border border-orange-100">
                            {songStatuses[currentIndex] === 'correct' ? (
                                <div className="text-green-600 font-bold text-lg mb-2">✅ Correct!</div>
                            ) : songStatuses[currentIndex] === 'skipped' ? (
                                <div className="text-yellow-600 font-bold text-lg mb-2">⏭ Skipped</div>
                            ) : (
                                <div className="text-red-500 font-bold text-lg mb-2">❌ Incorrect</div>
                            )}

                            <p className="text-gray-800 mb-4 font-medium">{currentSong.artist} - {currentSong.title}</p>

                            <button
                                onClick={moveToNext}
                                className="w-full py-2 rounded-md bg-orange-600 hover:bg-orange-700 text-white font-bold shadow-md transition-all active:scale-95"
                            >
                                Next Song →
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
