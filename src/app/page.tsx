'use client';

import { useState, useEffect } from 'react';
import { useSession, signOut } from 'next-auth/react';
import SequentialGame from '@/components/SequentialGame';
import SimultaneousGame from '@/components/SimultaneousGame';
import Login from '@/components/Login';
import { useSpotifyPlayerContext } from '@/contexts/SpotifyPlayerContext';

// Inner component to usage context
function GameContent({ token }: { token: string }) {
  const { pause } = useSpotifyPlayerContext();
  const [activeTab, setActiveTab] = useState<'sequential' | 'simultaneous'>('sequential');
  const { data: session } = useSession();

  // Pause when switching tabs
  useEffect(() => {
    pause();
  }, [activeTab, pause]);

  return (
    <div className="min-h-screen flex flex-col py-10 px-4 gap-10 bg-white text-gray-900 font-sans">
      <header className="text-center space-y-2">
        <h1 className="text-5xl font-extrabold tracking-tight text-black">Pixel Tunes</h1>
        <p className="text-gray-500 text-lg">Guess the artist from the pixelated cover and song.</p>
        <p className="text-xs text-green-600">Logged in as {session?.user?.name}</p>
        <button onClick={() => signOut()} className="text-xs text-red-500 underline mt-1 hover:text-red-600 transition-colors">
          Sign Out
        </button>
      </header>

      <nav className="flex justify-center gap-8 border-b border-gray-100 pb-1">
        <button
          className={`pb-2 text-lg font-medium transition-colors relative ${activeTab === 'sequential'
            ? 'text-orange-600'
            : 'text-gray-400 hover:text-gray-600'
            }`}
          onClick={() => setActiveTab('sequential')}
        >
          Sequential Mode
          {activeTab === 'sequential' && (
            <span className="absolute bottom-[-1px] left-0 w-full h-[3px] bg-orange-600 rounded-t-full" />
          )}
        </button>
        <button
          className={`pb-2 text-lg font-medium transition-colors relative ${activeTab === 'simultaneous'
            ? 'text-green-600'
            : 'text-gray-400 hover:text-gray-600'
            }`}
          onClick={() => setActiveTab('simultaneous')}
        >
          Simultaneous Mode
          {activeTab === 'simultaneous' && (
            <span className="absolute bottom-[-1px] left-0 w-full h-[3px] bg-green-600 rounded-t-full" />
          )}
        </button>
      </nav>

      <main className="flex-1 w-full max-w-7xl mx-auto">
        {activeTab === 'sequential' ? <SequentialGame token={token} /> : <SimultaneousGame token={token} />}
      </main>

      <footer className="text-center text-gray-400 text-sm py-8">
        Built for the Music Game Challenge
      </footer>
    </div>
  );
}

export default function Home() {
  const { data: session, status } = useSession();

  if (status === 'loading') {
    return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  }

  if (!session) {
    return <Login />;
  }

  const token = (session as any).accessToken;

  return <GameContent token={token} />;
}
