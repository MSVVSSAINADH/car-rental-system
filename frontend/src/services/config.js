import { useEffect, useState } from 'react';
import api from './api';

let cachedConfig = null;
let pendingRequest = null;

/**
 * Public runtime settings from GET /api/config. Cached for the session: the
 * values are product rules, not per-user data, and they do not change while
 * the app is open.
 */
export function loadAppConfig() {
    if (cachedConfig) return Promise.resolve(cachedConfig);
    if (!pendingRequest) {
        pendingRequest = api.get('/config')
            .then(({ data }) => {
                cachedConfig = data;
                return data;
            })
            .finally(() => {
                pendingRequest = null;
            });
    }
    return pendingRequest;
}

export function clearAppConfigCache() {
    cachedConfig = null;
}

export function useAppConfig() {
    const [config, setConfig] = useState(cachedConfig);

    useEffect(() => {
        if (config) return undefined;
        let active = true;
        // A missing config must not break the page; callers render without the
        // dynamic numbers instead of inventing them.
        loadAppConfig()
            .then(next => { if (active) setConfig(next); })
            .catch(() => {});
        return () => { active = false; };
    }, [config]);

    return config;
}
