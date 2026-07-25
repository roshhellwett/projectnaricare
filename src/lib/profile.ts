import { useState, useEffect } from "react";

export interface UserProfile {
  name: string;
  age: number;
}

export function useProfile() {
  const [profile, setProfileState] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    try {
      const stored = localStorage.getItem("nari_profile");
      if (stored) {
        setProfileState(JSON.parse(stored));
      }
    } catch (e) {
      console.error("Failed to load profile:", e);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const setProfile = (newProfile: UserProfile) => {
    localStorage.setItem("nari_profile", JSON.stringify(newProfile));
    setProfileState(newProfile);
    
    // Dispatch a custom event so other components (like index.tsx) can re-render immediately
    window.dispatchEvent(new CustomEvent("nari_profile_updated"));
  };

  // Add event listener to sync state across different components using the hook
  useEffect(() => {
    const handleProfileUpdate = () => {
      const stored = localStorage.getItem("nari_profile");
      if (stored) {
        setProfileState(JSON.parse(stored));
      }
    };
    
    window.addEventListener("nari_profile_updated", handleProfileUpdate);
    return () => window.removeEventListener("nari_profile_updated", handleProfileUpdate);
  }, []);

  return { profile, setProfile, isLoading };
}
