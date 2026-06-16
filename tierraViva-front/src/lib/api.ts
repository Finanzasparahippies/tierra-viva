// api.ts
import axios from "axios";
import { Product, BlogPost, Activity } from "./types";

const isServer = typeof window === "undefined";

// Priorizar variables de entorno para máxima flexibilidad.
// Si no hay variables, el fallback local es http://localhost:8000/api
const baseURL = isServer
    ? (process.env.INTERNAL_API_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api")
    : (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api");

console.log(`[API] baseURL: ${baseURL} | isServer: ${isServer}`);

const api = axios.create({
    baseURL,
    headers: {
        "Content-Type": "application/json",
    },
});

api.interceptors.request.use((config) => {
    if (typeof window !== "undefined") {
        try {
            const authStorage = localStorage.getItem("auth-storage");
            if (authStorage) {
                const parsed = JSON.parse(authStorage);
                const token = parsed.state?.token;
                console.log("Interceptor: Token found?", !!token);
                if (token) {
                    if (config.headers) {
                        config.headers.set('Authorization', `Bearer ${token}`);
                        console.log("Interceptor: Authorization header set");
                    }
                }
            } else {
                console.log("Interceptor: auth-storage not found in localStorage");
            }
        } catch (e) {
            console.error("Error in api interceptor:", e);
        }
    }
    return config;
}, (error) => Promise.reject(error));

export const login = async (credentials: any) => {
    const response = await api.post('/token/', credentials);
    return response.data;
};

export const register = async (userData: any) => {
    const response = await api.post('/users/', userData);
    return response.data;
};

const getAuthHeader = () => {
    if (typeof window !== "undefined") {
        try {
            const authStorage = localStorage.getItem("auth-storage");
            if (authStorage) {
                const parsed = JSON.parse(authStorage);
                const token = parsed.state?.token;
                if (token) return { 'Authorization': `Bearer ${token}` };
            }
        } catch (e) {
            console.error("Error getting auth header:", e);
        }
    }
    return {};
};

export const getMe = async (token?: string) => {
    const headers = token ? { 'Authorization': `Bearer ${token}` } : getAuthHeader();
    const response = await api.get('/users/me/', { headers });
    return response.data;
};

export const getSpecies = async () => {
    const response = await api.get('/species/');
    return response.data;
};

export const getTeam = async () => {
    const response = await api.get('/users/team/');
    return response.data;
};

export const updateMe = async (data: any, token?: string) => {
    const headers = token ? { 'Authorization': `Bearer ${token}` } : getAuthHeader();
    const response = await api.patch('/users/me/', data, { headers });
    return response.data;
};

export const getAnimals = async () => {
    const response = await api.get('/animals/');
    return response.data;
};
export const getProducts = async () => {
    const response = await api.get(`/products/?t=${Date.now()}`);
    return response.data;
};

export const getPosts = async () => {
    const response = await api.get('/posts/');
    return response.data;
};

export const getPostBySlug = async (slug: string) => {
    const response = await api.get(`/posts/${slug}/`);
    return response.data;
};

export const getProductBySlug = (slug: string) => api.get<Product>(`/products/${slug}/?t=${Date.now()}`).then(res => res.data);

export const getTiers = async () => {
    const response = await api.get('/sponsorship/tiers/');
    return response.data;
};

export const getAnimal = async (id: string | number) => {
    const response = await api.get(`/animals/${id}/`);
    return response.data;
};

export const getFolders = async (filters?: { animal?: number | string; species?: number | string }) => {
    const params = new URLSearchParams();
    if (filters?.animal) params.append('animal', String(filters.animal));
    if (filters?.species) params.append('species', String(filters.species));

    const response = await api.get(`/ranch-folders/?${params.toString()}`);
    return response.data;
};

export const getRanchFolders = async () => {
    const response = await api.get('/ranch-folders/');
    return response.data;
};

// export const getRanchUpdates = async () => {
//     const response = await api.get('/sponsorship/updates/');
//     return response.data;
// };

export const createOrder = async (orderData: any) => {
    const response = await api.post('/orders/', orderData, { headers: getAuthHeader() });
    return response.data;
};

export const createOrderCheckoutSession = async (orderId: number) => {
    const response = await api.post(`/orders/${orderId}/checkout/`, {
        success_url: `${window.location.origin}/success`,
        cancel_url: `${window.location.origin}/cancel`
    }, { headers: getAuthHeader() });
    return response.data;
};

export const createCheckoutSession = async (tierId: number, animalId?: number, is_annual: boolean = false) => {
    const response = await api.post('/sponsorship/checkout/', {
        tier_id: tierId,
        animal_id: animalId,
        is_annual: is_annual,
        success_url: `${window.location.origin}/success`,
        cancel_url: `${window.location.origin}/cancel`
    }, { headers: getAuthHeader() });
    return response.data;
};

// Cart API
export const apiGetCart = async () => {
    const response = await api.get("/cart/mine/");
    return response.data;
};

export const apiAddToCart = async (productId: number, quantity: number = 1) => {
    const response = await api.post("/cart/add_item/", { product_id: productId, quantity });
    return response.data;
};

export const apiRemoveFromCart = async (productId: number) => {
    const response = await api.post("/cart/remove_item/", { product_id: productId });
    return response.data;
};

export const apiConfirmOrder = async (orderId: number) => {
    const response = await api.post(`/orders/${orderId}/confirm/`);
    return response.data;
};

export const apiClearCart = async () => {
    const response = await api.post("/cart/clear/");
    return response.data;
};

export const requestPasswordReset = async (email: string) => {
    const response = await api.post("/users/password_reset_request/", { email });
    return response.data;
};

export const confirmPasswordReset = async (data: any) => {
    const response = await api.post("/users/password_reset_confirm/", data);
    return response.data;
};

export const createRescueRequest = async (data: any) => {
    const response = await api.post("/rescues/", data);
    return response.data;
};

// Activity API
export const getRanchUpdates = async (params?: { search?: string; tag?: string }) => {
    try {
        const query = new URLSearchParams();
        if (params?.search) query.append('search', params.search);
        if (params?.tag) query.append('tag', params.tag);

        const response = await api.get(`/sponsorship/updates/?${query.toString()}`);
        return response.data;
    } catch (error) {
        console.error("Error fetching ranch updates:", error);
        return [];
    }
};

export const getRanchTags = async () => {
    try {
        const response = await api.get('/sponsorship/tags/');
        return response.data;
    } catch (error) {
        console.error("Error fetching ranch tags:", error);
        return [];
    }
};

export const getActivities = async () => {
    try {
        const response = await api.get('/activities/');
        return response.data;
    } catch (error) {
        console.error("API Error [getActivities]:", error);
        return []; // Return empty array to prevent page crash
    }
};

export const getActivityBySlug = async (slug: string) => {
    try {
        const response = await api.get(`/activities/${slug}/`);
        return response.data;
    } catch (error) {
        console.error("API Error [getActivityBySlug]:", error);
        return null;
    }
};

export const createActivityCheckoutSession = async (slug: string, tickets: number = 1) => {
    const response = await api.post(`/activities/${slug}/checkout/`, { tickets }, { headers: getAuthHeader() });
    return response.data;
};

export const subscribeNewsletter = async (email: string) => {
    const response = await api.post('/newsletter/subscribers/', { email });
    return response.data;
};

export const getUserSponsorships = async () => {
    const response = await api.get('/sponsorship/mine/', { headers: getAuthHeader() });
    return response.data;
};

export const getAnalyticsOverview = async () => {
    const response = await api.get('/dashboard/analytics/', { headers: getAuthHeader() });
    return response.data;
};

export const getSystemMetrics = async () => {
    const response = await api.get('/dashboard/system/', { headers: getAuthHeader() });
    return response.data;
};

export const getUserOrders = async () => {
    const response = await api.get('/orders/', { headers: getAuthHeader() });
    return response.data;
};

export const getUserBookings = async () => {
    const response = await api.get('/activities/bookings/', { headers: getAuthHeader() });
    return response.data;
};

export const getUserRescues = async () => {
    const response = await api.get('/rescues/', { headers: getAuthHeader() });
    return response.data;
};

export default api;
