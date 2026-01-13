import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { api } from '../lib/api';
import type { Profile } from '../types';

interface ProfileContextData {
    currentProfile: Profile | null;
    profiles: Profile[];
    isLoading: boolean;
    selectProfile: (profile: Profile) => void;
    createProfile: (name: string, avatarUrl: string) => Promise<void>;
    refreshProfiles: () => Promise<void>;
}

const ProfileContext = createContext({} as ProfileContextData);

export function ProfileProvider({ children }: { children: ReactNode }) {
    const [profiles, setProfiles] = useState<Profile[]>([]);
    const [currentProfile, setCurrentProfile] = useState<Profile | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadProfiles();
    }, []);

    async function loadProfiles() {
        try {
            const res = await api.get('/profiles');
            setProfiles(res.data);

            const savedId = localStorage.getItem('RSS_profile_id');
            if (savedId) {
                const found = res.data.find((p: Profile) => p.id === savedId);
                if (found) setCurrentProfile(found);
            }
        } catch (error) {
            console.error('Error loading profiles:', error);
        } finally {
            setIsLoading(false);
        }
    }

    function selectProfile(profile: Profile) {
        setCurrentProfile(profile);
        localStorage.setItem('RSS_profile_id', profile.id);
        window.location.reload();
    }

    async function createProfile(name: string, avatarUrl: string) {
        const res = await api.post('/profiles', { name, avatar: avatarUrl });
        const newProfile = res.data;
        setProfiles((prev) => [...prev, newProfile]);
        selectProfile(newProfile);
    }

    return (
        <ProfileContext.Provider value={{
            currentProfile,
            profiles,
            isLoading,
            selectProfile,
            createProfile,
            refreshProfiles: loadProfiles
        }}>
            {children}
        </ProfileContext.Provider>
    );
}

export const useProfile = () => useContext(ProfileContext);