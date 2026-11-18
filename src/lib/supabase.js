
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabasePublishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

const PREFERENCE_KEY = 'daymark-remember-me';

const projectRef = new URL(supabaseUrl).hostname.split('.')[0];
const storagePrefix = `sb-${projectRef}-`;

function getPreferredStorage() {
  const rememberMe = localStorage.getItem(PREFERENCE_KEY) !== 'false';

  return rememberMe ? localStorage : sessionStorage;
}

const customStorage = {
  getItem(key) {
    return getPreferredStorage().getItem(key);
  },

  setItem(key, value) {
    const preferredStorage = getPreferredStorage();
    const otherStorage =
      preferredStorage === localStorage ? sessionStorage : localStorage;

    otherStorage.removeItem(key);
    preferredStorage.setItem(key, value);
  },

  removeItem(key) {
    localStorage.removeItem(key);
    sessionStorage.removeItem(key);
  },
};

// Call this before signing in to select the session storage.
export function setRememberMePreference(rememberMe) {
  localStorage.setItem(
    PREFERENCE_KEY,
    rememberMe ? 'true' : 'false'
  );

  const storageToClear = rememberMe ? sessionStorage : localStorage;

  Object.keys(storageToClear)
    .filter((key) => key.startsWith(storagePrefix))
    .forEach((key) => storageToClear.removeItem(key));
}

export const supabase = createClient(
  supabaseUrl,
  supabasePublishableKey,
  {
    auth: {
      storage: customStorage,
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  }
);
