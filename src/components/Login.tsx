'use client';

import { signIn } from 'next-auth/react';

export default function Login() {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white gap-6">
            <h1 className="text-4xl font-bold">Pixel Tunes</h1>
            <p className="text-gray-400 text-lg text-center max-w-md">
                Sign in with Spotify to play. <br />
                <span className="text-sm text-yellow-500">Requires Spotify Premium for playback.</span>
            </p>
            <button
                onClick={() => signIn('spotify', { callbackUrl: '/' })}
                className="px-8 py-4 bg-green-500 hover:bg-green-600 text-black font-bold rounded-full transition-transform hover:scale-105"
            >
                Sign in with Spotify
            </button>
        </div>
    );
}
