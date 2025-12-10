'use client';

import { SessionProvider, useSession } from 'next-auth/react';
import { SpotifyPlayerProvider } from '../contexts/SpotifyPlayerContext';

// We need a sub-component to access session, as SessionProvider is at the root
function SpotifyContextWrapper({ children }: { children: React.ReactNode }) {
    const { data: session } = useSession();
    // Only initialize SDK provider if we have an access token
    const token = (session as any)?.accessToken || '';

    return (
        <SpotifyPlayerProvider accessToken={token}>
            {children}
        </SpotifyPlayerProvider>
    );
}

export default function Providers({ children }: { children: React.ReactNode }) {
    return (
        <SessionProvider>
            <SpotifyContextWrapper>
                {children}
            </SpotifyContextWrapper>
        </SessionProvider>
    );
}
