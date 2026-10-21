export const SESSION_KEY = 'user';

export function readSession() {
    try {
        return JSON.parse(localStorage.getItem(SESSION_KEY)) || null;
    } catch {
        return null;
    }
}

export function saveSession(user) {
    localStorage.setItem(SESSION_KEY, JSON.stringify(user));
}

export function clearSession() {
    localStorage.removeItem(SESSION_KEY);
}

/**
 * Merges a profile payload into the stored session.
 *
 * GET /api/customer/profile returns a UserDto, which has no JWT: merging it
 * wholesale used to overwrite the stored token with null and the next
 * authenticated request bounced the user to the login screen. Only the fields
 * the profile page can actually change are copied over, and the token is
 * always taken from the existing session.
 */
const EDITABLE_PROFILE_FIELDS = ['name', 'profileImage', 'licenseImage'];

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
