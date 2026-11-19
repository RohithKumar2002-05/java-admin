const BASE = `${import.meta.env.VITE_API_URL}/api`;

const getToken = () => localStorage.getItem('admin_token');

const getOrCreateDeviceId = (): string => {
    let id = localStorage.getItem('device_id');
    if (!id) { id = crypto.randomUUID(); localStorage.setItem('device_id', id); }
    return id;
};

export const req = async (url: string, options: RequestInit = {}) => {
    const token = getToken();
    options.headers = {
        ...(options.body instanceof FormData ? {} : { 'Content-Type': 'application/json' }),
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        'X-Device-ID': getOrCreateDeviceId(),
        ...options.headers,
    };
    const res = await fetch(`${BASE}${url}`, options);
    const json = await res.json().catch(() => ({ message: `Request failed (${res.status})` }));
    if (res.status === 401) {
        localStorage.removeItem('admin_token');
        if (!window.location.pathname.includes('/login')) {
            window.location.href = '/login';
        }
        throw json;
    }
    if (!res.ok) throw json;
    return json;
};
