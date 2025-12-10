'use client';

import { useState, useRef, useEffect } from 'react';
import { ARTISTS } from '../data/artists';

interface ArtistInputProps {
    value: string;
    onChange: (value: string) => void;
    onSubmit: () => void;
    disabled?: boolean;
    hasError?: boolean;
}

export default function ArtistInput({ value, onChange, onSubmit, disabled, hasError }: ArtistInputProps) {
    const [suggestions, setSuggestions] = useState<string[]>([]);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const wrapperRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setShowSuggestions(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [wrapperRef]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newVal = e.target.value;
        onChange(newVal);

        if (newVal.length > 0) {
            const filtered = ARTISTS.filter((artist) =>
                artist.toLowerCase().includes(newVal.toLowerCase())
            );
            setSuggestions(filtered);
            setShowSuggestions(true);
        } else {
            setShowSuggestions(false);
        }
    };

    const handleSelect = (artist: string) => {
        onChange(artist);
        setShowSuggestions(false);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            onSubmit();
            setShowSuggestions(false);
        }
    }

    return (
        <div className="relative w-full max-w-xs" ref={wrapperRef}>
            <input
                type="text"
                className={`w-full p-3 text-base border rounded-md transition-colors focus:outline-none focus:border-black ${hasError ? 'border-red-500 bg-red-50' : 'border-gray-200'
                    } ${disabled ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                value={value}
                onChange={handleChange}
                onKeyDown={handleKeyDown}
                placeholder="Guess the artist..."
                disabled={disabled}
            />
            {showSuggestions && suggestions.length > 0 && (
                <ul className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-b-md list-none p-0 m-0 max-h-48 overflow-y-auto z-10 shadow-lg">
                    {suggestions.map((artist) => (
                        <li
                            key={artist}
                            onClick={() => handleSelect(artist)}
                            className="p-2 cursor-pointer hover:bg-gray-100 transition-colors"
                        >
                            {artist}
                        </li>
                    ))}
                </ul>
            )}
        </div>
    );
}
