import { useMemo, useSyncExternalStore } from 'react';

export const SESSION_KEY = 'user';
const SESSION_EVENT = 'carrentalx:session-changed';

function emitSessionChange() {
    window.dispatchEvent(new Event(SESSION_EVENT));
}

export function readSession() {
    try {
        return JSON.parse(localStorage.getItem(SESSION_KEY)) || null;
    } catch {
        return null;
    }
}

export function saveSession(user) {
    localStorage.setItem(SESSION_KEY, JSON.stringify(user));
    emitSessionChange();
}

export function clearSession() {
    localStorage.removeItem(SESSION_KEY);
    emitSessionChange();
}

function subscribeToSession(callback) {
    window.addEventListener('storage', callback);
    window.addEventListener(SESSION_EVENT, callback);
    return () => {
        window.removeEventListener('storage', callback);
        window.removeEventListener(SESSION_EVENT, callback);
    };
}

function getSessionSnapshot() {
    return localStorage.getItem(SESSION_KEY);
}

/** Session state that re-renders the caller when sign-in, profile or sign-out changes it. */
export function useSession() {
    const raw = useSyncExternalStore(subscribeToSession, getSessionSnapshot);
    return useMemo(() => {
        if (!raw) return null;
        try {
            return JSON.parse(raw);
        } catch {
            return null;
        }
    }, [raw]);
}

const EDITABLE_PROFILE_FIELDS = ['name', 'profileImage', 'licenseImage'];

/**
 * Merges a profile payload into the stored session.
 *
 * GET /api/customer/profile returns a UserDto, which has no JWT: merging it
 * wholesale used to overwrite the stored token with null and the next
 * authenticated request bounced the user to the login screen. Only the fields
 * the profile page can actually change are copied over, and the token is
 * always taken from the existing session.
 */
export function mergeProfileIntoSession(storedUser, profile) {
    const session = { ...(storedUser || {}) };
    const editableFields = {};
    EDITABLE_PROFILE_FIELDS.forEach((field) => {
        if (profile && profile[field] !== undefined) {
            editableFields[field] = profile[field];
        }
    });
    return {
        ...session,
        ...editableFields,
        token: session.token ?? profile?.token ?? null,
    };
}
