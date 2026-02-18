// ─── API Client — replaces Supabase ──────────────────────────────────────────
// All requests go to our own secure Node.js backend.

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

// ─── Token Storage ────────────────────────────────────────────────────────────
export const tokenStorage = {
    get: () => localStorage.getItem('rg_token'),
    set: (t: string) => localStorage.setItem('rg_token', t),
    clear: () => localStorage.removeItem('rg_token'),
};

// ─── Core Fetch Helper ────────────────────────────────────────────────────────
async function apiFetch(path: string, options: RequestInit = {}) {
    const token = tokenStorage.get();
    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...(options.headers as Record<string, string>),
    };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const res = await fetch(`${BASE_URL}${path}`, { ...options, headers });
    const json = await res.json().catch(() => ({}));

    if (!res.ok) {
        throw new Error(json.error || `HTTP ${res.status}`);
    }
    return json;
}

// ─── Auth ─────────────────────────────────────────────────────────────────────
export const api = {
    auth: {
        login: (email: string, password: string) =>
            apiFetch('/api/auth/login', { method: 'POST', body: JSON.stringify({ email, password }) }),

        register: (email: string, password: string, name: string, phone: string) =>
            apiFetch('/api/auth/register', { method: 'POST', body: JSON.stringify({ email, password, name, phone }) }),

        me: () => apiFetch('/api/auth/me'),

        updateProfile: (data: { name?: string; phone?: string; address?: string }) =>
            apiFetch('/api/auth/profile', { method: 'PUT', body: JSON.stringify(data) }),
    },

    // ─── Products ───────────────────────────────────────────────────────────────
    products: {
        list: () => apiFetch('/api/products'),
        get: (id: string) => apiFetch(`/api/products/${id}`),
        create: (data: any) => apiFetch('/api/products', { method: 'POST', body: JSON.stringify(data) }),
        update: (id: string, data: any) => apiFetch(`/api/products/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
        delete: (id: string) => apiFetch(`/api/products/${id}`, { method: 'DELETE' }),
    },

    // ─── Categories ─────────────────────────────────────────────────────────────
    categories: {
        list: () => apiFetch('/api/categories'),
        create: (data: any) => apiFetch('/api/categories', { method: 'POST', body: JSON.stringify(data) }),
    },

    // ─── Orders ─────────────────────────────────────────────────────────────────
    orders: {
        list: () => apiFetch('/api/orders'),
        create: (data: any) => apiFetch('/api/orders', { method: 'POST', body: JSON.stringify(data) }),
        updateStatus: (id: string, status: string) =>
            apiFetch(`/api/orders/${id}/status`, { method: 'PUT', body: JSON.stringify({ status }) }),
    },

    // ─── Clients (admin) ────────────────────────────────────────────────────────
    clients: {
        list: () => apiFetch('/api/clients'),
        updateRole: (id: string, role: string) =>
            apiFetch(`/api/clients/${id}/role`, { method: 'PUT', body: JSON.stringify({ role }) }),
    },
};

// ─── Image URL Helper (unchanged) ────────────────────────────────────────────
export const getProductImageUrl = (path: string | null): string => {
    if (!path) return 'https://picsum.photos/seed/mirror/400/400';
    if (path.startsWith('http')) return path;
    return `${BASE_URL}/uploads/${path}`;
};
